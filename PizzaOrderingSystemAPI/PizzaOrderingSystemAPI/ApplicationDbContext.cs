using Microsoft.EntityFrameworkCore;
using PizzaOrderingSystemAPI.Models;

namespace PizzaOrderingSystemAPI;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Pizza> Pizzas { get; set; }
    public DbSet<Size> Sizes { get; set; }
    public DbSet<Topping> Toppings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pizza>()
            .HasMany(p => p.Toppings)
            .WithMany();
    }
}
