using Microsoft.EntityFrameworkCore;
using System;



var builder = WebApplication.CreateBuilder(args);

// MySQL Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddEndpointsApiExplorer();


var app = builder.Build();

app.MapGet("/pizze",(AppDbContext db) =>
{
    var pizze = db.Pizza
    .Include(p =>p.Ingredienti_Pizza).ThenInclude(ip =>ip.Nome_Ingrediente).ToList();
    return Results.Ok(pizze);
} );

app.Run();
//modeli db
public class Pizza
{
    public int Id { get; set; }
    public string Ingredienti { get; set; } = string.Empty;
    public string Img_pizza { get; set; } = string.Empty;
    public List<Ingrediente_Pizza> Ingredienti_Pizza { get; set; }


}
public class Ingrediente
{
    public int Id { get; set; }
    public string Nome_Ingrediente { get; set; } = string.Empty;
    public List<Ingrediente_Pizza> Ingredienti_Pizza { get; set; }

}
public class Ingrediente_Pizza
{
    public int id { get; set; }
    public int Pizza { get; set; }
    public Pizza Pizza1 { get; set; }
    public int Ingredienti { get; set; }
    public Ingrediente Nome_Ingrediente { get; set; }
}


public class AppDbContext : DbContext
{
    public
        AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Pizza> Pizza { get; set; }
    public DbSet<Ingrediente> Ingredienti { get; set; }
    public DbSet<Ingrediente_Pizza> Ingredienti_Pizza { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ingrediente_Pizza>().HasOne(ip => ip.Pizza1).WithMany(p => p.Ingredienti_Pizza).HasForeignKey(ip => ip.Pizza);
        modelBuilder.Entity<Ingrediente_Pizza>().HasOne(ip => ip.Nome_Ingrediente).WithMany(p => p.Ingredienti_Pizza).HasForeignKey(ip => ip.Ingredienti);
    }
}
