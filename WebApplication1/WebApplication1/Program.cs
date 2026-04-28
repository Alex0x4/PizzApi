using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);

// MySQL Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddEndpointsApiExplorer();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowAll"); 



// Endpoints

//GET
app.MapGet("/pizze", async (AppDbContext db) =>
{
var pizze = await db.Pizza.ToListAsync();
return Results.Ok(pizze);
});


app.MapGet("/ingredienti", async (AppDbContext db) =>
{
var ingredienti = await db.Ingredienti.ToListAsync();
return Results.Ok(ingredienti);
});

app.MapGet("/ingredienti_pizza", async (AppDbContext db) =>
{
var relazioni = await db.Ingredienti_Pizza.ToListAsync();
return Results.Ok(relazioni);
});


app.MapGet("/pizza/nome/{nome}", async (string nome, AppDbContext db) =>
{
var pizza = await db.Pizza
    .Include(p => p.Ingredienti_Pizza)
    .ThenInclude(ip => ip.Ingrediente)
    .FirstOrDefaultAsync(p => p.nome_pizza.ToLower() == nome.ToLower());

if (pizza == null) return Results.NotFound($"Pizza '{nome}' non trovata");

var result = new
{
pizza.id,
pizza.nome_pizza,
pizza.img_pizza,
ingredienti = pizza.Ingredienti_Pizza.Select(ip => ip.Ingrediente.nome_ingrediente).ToList()
};

return Results.Ok(result);
});
//POST

// Aggiungi una nuova pizza
app.MapPost("/pizze", async (AppDbContext db, Pizza nuovaPizza) =>
{
    // Verifica se esiste già una pizza con lo stesso nome
    var esistente = await db.Pizza.FirstOrDefaultAsync(p => p.nome_pizza.ToLower() == nuovaPizza.nome_pizza.ToLower());
    if (esistente != null)
        return Results.BadRequest($"Una pizza con nome '{nuovaPizza.nome_pizza}' esiste già");

    db.Pizza.Add(nuovaPizza);
    await db.SaveChangesAsync();
    return Results.Created($"/pizze/{nuovaPizza.id}", nuovaPizza);
});

// Aggiungi un nuovo ingrediente
app.MapPost("/ingredienti", async (AppDbContext db, Ingredienti nuovoIngrediente) =>
{
    var esistente = await db.Ingredienti.FirstOrDefaultAsync(i => i.nome_ingrediente.ToLower() == nuovoIngrediente.nome_ingrediente.ToLower());
    if (esistente != null)
        return Results.BadRequest($"L'ingrediente '{nuovoIngrediente.nome_ingrediente}' esiste già");

    db.Ingredienti.Add(nuovoIngrediente);
    await db.SaveChangesAsync();
    return Results.Created($"/ingredienti/{nuovoIngrediente.id}", nuovoIngrediente);
});

// Aggiungi un ingrediente a una pizza (crea relazione)
app.MapPost("/pizza/{pizzaId}/ingrediente/{ingredienteId}", async (int pizzaId, int ingredienteId, AppDbContext db) =>
{
    // Verifica se pizza esiste
    var pizza = await db.Pizza.FindAsync(pizzaId);
    if (pizza == null)
        return Results.NotFound($"Pizza con ID {pizzaId} non trovata");

    // Verifica se ingrediente esiste
    var ingrediente = await db.Ingredienti.FindAsync(ingredienteId);
    if (ingrediente == null)
        return Results.NotFound($"Ingrediente con ID {ingredienteId} non trovato");

    // Verifica se la relazione esiste già
    var relazioneEsistente = await db.Ingredienti_Pizza
        .FirstOrDefaultAsync(ip => ip.PizzaId == pizzaId && ip.IngredienteId == ingredienteId);

    if (relazioneEsistente != null)
        return Results.BadRequest($"L'ingrediente '{ingrediente.nome_ingrediente}' è già presente nella pizza '{pizza.nome_pizza}'");

    // Crea nuova relazione
    var nuovaRelazione = new Ingrediente_Pizza
    {
        PizzaId = pizzaId,
        IngredienteId = ingredienteId
    };

    db.Ingredienti_Pizza.Add(nuovaRelazione);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = $"Ingrediente '{ingrediente.nome_ingrediente}' aggiunto alla pizza '{pizza.nome_pizza}'", relazione = nuovaRelazione });
});

// ==================== ENDPOINT PUT (UPDATE) ====================

// Aggiorna una pizza esistente
app.MapPut("/pizze/{id}", async (int id, AppDbContext db, Pizza pizzaAggiornata) =>
{
    var pizza = await db.Pizza.FindAsync(id);
    if (pizza == null)
        return Results.NotFound($"Pizza con ID {id} non trovata");

    pizza.nome_pizza = pizzaAggiornata.nome_pizza;
    pizza.img_pizza = pizzaAggiornata.img_pizza;

    await db.SaveChangesAsync();
    return Results.Ok(pizza);
});

// Aggiorna un ingrediente esistente
app.MapPut("/ingredienti/{id}", async (int id, AppDbContext db, Ingredienti ingredienteAggiornato) =>
{
    var ingrediente = await db.Ingredienti.FindAsync(id);
    if (ingrediente == null)
        return Results.NotFound($"Ingrediente con ID {id} non trovato");

    ingrediente.nome_ingrediente = ingredienteAggiornato.nome_ingrediente;

    await db.SaveChangesAsync();
    return Results.Ok(ingrediente);
});

// ==================== ENDPOINT DELETE (DELETE) ====================

// Elimina una pizza (elimina anche le relazioni collegate)
app.MapDelete("/pizze/{id}", async (int id, AppDbContext db) =>
{
    var pizza = await db.Pizza
        .Include(p => p.Ingredienti_Pizza)
        .FirstOrDefaultAsync(p => p.id == id);

    if (pizza == null)
        return Results.NotFound($"Pizza con ID {id} non trovata");

    // Le relazioni verranno eliminate automaticamente grazie al vincolo ON DELETE CASCADE
    db.Pizza.Remove(pizza);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = $"Pizza '{pizza.nome_pizza}' eliminata con successo" });
});

// Elimina un ingrediente (elimina anche le relazioni collegate)
app.MapDelete("/ingredienti/{id}", async (int id, AppDbContext db) =>
{
    var ingrediente = await db.Ingredienti
        .Include(i => i.Ingredienti_Pizza)
        .FirstOrDefaultAsync(i => i.id == id);

    if (ingrediente == null)
        return Results.NotFound($"Ingrediente con ID {id} non trovato");

    db.Ingredienti.Remove(ingrediente);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = $"Ingrediente '{ingrediente.nome_ingrediente}' eliminato con successo" });
});

// Rimuovi un ingrediente da una pizza (elimina solo la relazione)
app.MapDelete("/pizza/{pizzaId}/ingrediente/{ingredienteId}", async (int pizzaId, int ingredienteId, AppDbContext db) =>
{
    var relazione = await db.Ingredienti_Pizza
        .FirstOrDefaultAsync(ip => ip.PizzaId == pizzaId && ip.IngredienteId == ingredienteId);

    if (relazione == null)
        return Results.NotFound($"Relazione tra pizza {pizzaId} e ingrediente {ingredienteId} non trovata");

    db.Ingredienti_Pizza.Remove(relazione);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = $"Ingrediente rimosso dalla pizza con successo" });
});

app.Run();



// Models
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

// DbContext
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Pizza> Pizza { get; set; }
    public DbSet<Ingredienti> Ingredienti { get; set; }
    public DbSet<Ingrediente_Pizza> Ingredienti_Pizza { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Mapping tabelle con i nomi esatti del database
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

            // Mapping delle foreign key columns
            entity.Property(e => e.PizzaId).HasColumnName("pizza");
            entity.Property(e => e.IngredienteId).HasColumnName("ingredienti");

            // Relazioni
            entity.HasOne(ip => ip.Pizza)
                .WithMany(p => p.Ingredienti_Pizza)
                .HasForeignKey(ip => ip.PizzaId);

            entity.HasOne(ip => ip.Ingrediente)
                .WithMany(i => i.Ingredienti_Pizza)
                .HasForeignKey(ip => ip.IngredienteId);
        });
    }
}