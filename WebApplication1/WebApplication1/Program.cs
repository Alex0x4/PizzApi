using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);

// MySQL Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Endpoints
app.MapGet("/pizze", async (AppDbContext db) =>
{
var pizze = await db.Pizza.ToListAsync();
return Results.Ok(pizze);
});

app.MapGet("/pizze/{id}", async (int id, AppDbContext db) =>
{
var pizza = await db.Pizza.FindAsync(id);
if (pizza == null) return Results.NotFound();
return Results.Ok(pizza);
});

app.MapGet("/ingredienti", async (AppDbContext db) =>
{
var ingredienti = await db.Ingredienti.ToListAsync();
return Results.Ok(ingredienti);
});

app.MapGet("/ingredienti/{id}", async (int id, AppDbContext db) =>
{
var ingrediente = await db.Ingredienti.FindAsync(id);
if (ingrediente == null) return Results.NotFound();
return Results.Ok(ingrediente);
});

app.MapGet("/ingredienti_pizza", async (AppDbContext db) =>
{
var relazioni = await db.Ingredienti_Pizza.ToListAsync();
return Results.Ok(relazioni);
});

app.MapGet("/pizza/{id}/ingredienti", async (int id, AppDbContext db) =>
{
var pizza = await db.Pizza
    .Include(p => p.Ingredienti_Pizza)
    .ThenInclude(ip => ip.Ingrediente)
    .FirstOrDefaultAsync(p => p.id == id);

if (pizza == null) return Results.NotFound($"Pizza con ID {id} non trovata");

var result = new
{
pizza.id,
pizza.nome_pizza,
pizza.img_pizza,
ingredienti = pizza.Ingredienti_Pizza.Select(ip => new
{
ip.Ingrediente.id,
ip.Ingrediente.nome_ingrediente
}).ToList()
};

return Results.Ok(result);
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

app.MapGet("/ingrediente/{id}/pizze", async (int id, AppDbContext db) =>
{
var ingrediente = await db.Ingredienti
    .Include(i => i.Ingredienti_Pizza)
    .ThenInclude(ip => ip.Pizza)
    .FirstOrDefaultAsync(i => i.id == id);

if (ingrediente == null) return Results.NotFound($"Ingrediente con ID {id} non trovato");

var result = new
{
ingrediente.id,
ingrediente.nome_ingrediente,
pizze = ingrediente.Ingredienti_Pizza.Select(ip => new
{
ip.Pizza.id,
ip.Pizza.nome_pizza,
ip.Pizza.img_pizza
}).ToList()
};

return Results.Ok(result);
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