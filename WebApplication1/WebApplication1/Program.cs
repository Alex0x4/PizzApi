using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// MySQL Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/", () => Results.Redirect("Pizzapi_F/index.html"));

// ==================== ENDPOINTS ====================

// GET - Cerca pizza per nome
app.MapGet("/pizza/nome/{nome}", async (string nome, AppDbContext db) =>
{
    var pizza = await db.Pizza
        .Include(p => p.Ingredienti_Pizza)
        .ThenInclude(ip => ip.Ingrediente)
        .FirstOrDefaultAsync(p => p.nome_pizza.ToLower() == nome.ToLower());

    if (pizza == null)
        return Results.NotFound();

    var result = new
    {
        pizza.id,
        pizza.nome_pizza,
        pizza.img_pizza,
        ingredienti = pizza.Ingredienti_Pizza.Select(ip => ip.Ingrediente.nome_ingrediente).ToList()
    };

    return Results.Ok(result);
});

// GET - Tutti gli ingredienti (per il dropdown)
app.MapGet("/ingredienti", async (AppDbContext db) =>
{
    var ingredienti = await db.Ingredienti.ToListAsync();
    return Results.Ok(ingredienti);
});

// PUT - Modifica pizza
app.MapPut("/pizze/{id}", async (int id, AppDbContext db, Pizza pizzaAggiornata) =>
{
    var pizza = await db.Pizza.FindAsync(id);
    if (pizza == null)
        return Results.NotFound();

    pizza.nome_pizza = pizzaAggiornata.nome_pizza;
    pizza.img_pizza = pizzaAggiornata.img_pizza;

    await db.SaveChangesAsync();
    return Results.Ok(pizza);
});

// POST - Aggiungi nuovo ingrediente
app.MapPost("/ingredienti", async (AppDbContext db, Ingredienti nuovoIngrediente) =>
{
    db.Ingredienti.Add(nuovoIngrediente);
    await db.SaveChangesAsync();
    return Results.Ok(nuovoIngrediente);
});

// POST - Associa ingrediente a pizza
app.MapPost("/pizza/{pizzaId}/ingrediente/{ingredienteId}", async (int pizzaId, int ingredienteId, AppDbContext db) =>
{
    var relazione = new Ingrediente_Pizza
    {
        PizzaId = pizzaId,
        IngredienteId = ingredienteId
    };

    db.Ingredienti_Pizza.Add(relazione);
    await db.SaveChangesAsync();
    return Results.Ok(relazione);
});

// DELETE - Elimina pizza
app.MapDelete("/pizze/{id}", async (int id, AppDbContext db) =>
{
    var pizza = await db.Pizza.FindAsync(id);
    if (pizza == null)
        return Results.NotFound();

    db.Pizza.Remove(pizza);
    await db.SaveChangesAsync();
    return Results.Ok();
});

// DELETE - Rimuovi ingrediente da pizza
app.MapDelete("/pizza/{pizzaId}/ingrediente/{ingredienteId}", async (int pizzaId, int ingredienteId, AppDbContext db) =>
{
    var relazione = await db.Ingredienti_Pizza
        .FirstOrDefaultAsync(ip => ip.PizzaId == pizzaId && ip.IngredienteId == ingredienteId);

    if (relazione == null)
        return Results.NotFound();

    db.Ingredienti_Pizza.Remove(relazione);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.Run();

// ==================== MODELS ====================

public class Pizza
{
    public int id { get; set; }
    public string nome_pizza { get; set; } = string.Empty;
    public string img_pizza { get; set; } = string.Empty;
    public List<Ingrediente_Pizza> Ingredienti_Pizza { get; set; } = new();
}

public class Ingredienti
{
    public int id { get; set; }
    public string nome_ingrediente { get; set; } = string.Empty;
    public List<Ingrediente_Pizza> Ingredienti_Pizza { get; set; } = new();
}

public class Ingrediente_Pizza
{
    public int id { get; set; }
    public int PizzaId { get; set; }
    public int IngredienteId { get; set; }

    public Pizza Pizza { get; set; } = null!;
    public Ingredienti Ingrediente { get; set; } = null!;
}

// ==================== DB CONTEXT ====================

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Pizza> Pizza { get; set; }
    public DbSet<Ingredienti> Ingredienti { get; set; }
    public DbSet<Ingrediente_Pizza> Ingredienti_Pizza { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pizza>(entity =>
        {
            entity.ToTable("pizza");
            entity.HasKey(e => e.id);
            entity.Property(e => e.nome_pizza).HasColumnName("nome_pizza");
            entity.Property(e => e.img_pizza).HasColumnName("img_pizza");
        });

        modelBuilder.Entity<Ingredienti>(entity =>
        {
            entity.ToTable("ingredienti");
            entity.HasKey(e => e.id);
            entity.Property(e => e.nome_ingrediente).HasColumnName("nome_ingrediente");
        });

        modelBuilder.Entity<Ingrediente_Pizza>(entity =>
        {
            entity.ToTable("ingredienti_pizza");
            entity.HasKey(e => e.id);

            entity.Property(e => e.PizzaId).HasColumnName("pizza");
            entity.Property(e => e.IngredienteId).HasColumnName("ingredienti");

            entity.HasOne(ip => ip.Pizza)
                .WithMany(p => p.Ingredienti_Pizza)
                .HasForeignKey(ip => ip.PizzaId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ip => ip.Ingrediente)
                .WithMany(i => i.Ingredienti_Pizza)
                .HasForeignKey(ip => ip.IngredienteId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}