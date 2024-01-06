using PizzaOrderingSystemAPI.Models;

namespace PizzaOrderingSystemAPI;

public class DbSeeder
{
    private readonly ApplicationDbContext _db;

    public DbSeeder(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task SeedAsync()
    {
        await AddSizes();
        await AddToppings();
    }

    private async Task AddSizes()
    {
        var sizes = new List<Size>
        {
            new Size { SizeId = 1, Name = "Small" , CurrentPrice = 8 },
            new Size { SizeId = 2, Name = "Medium", CurrentPrice = 10 },
            new Size { SizeId = 3, Name = "Large", CurrentPrice = 12 }
        };
        _db.Sizes.AddRange(sizes);
        await _db.SaveChangesAsync();
    }

    private async Task AddToppings()
    {
        var toppings = new List<Topping>
        {
            new Topping { ToppingId = 1, Name = "Tomato sauce" , CurrentPrice = 1 },
            new Topping { ToppingId = 2, Name = "Cheese", CurrentPrice = 1 },
            new Topping { ToppingId = 3, Name = "Bacon", CurrentPrice = 1 },
            new Topping { ToppingId = 4, Name = "Green peppers", CurrentPrice = 1 },
            new Topping { ToppingId = 5, Name = "Onions", CurrentPrice = 1 },
            new Topping { ToppingId = 6, Name = "Chicken", CurrentPrice = 1 }
        };
        _db.Toppings.AddRange(toppings);
        await _db.SaveChangesAsync();
    }
}
