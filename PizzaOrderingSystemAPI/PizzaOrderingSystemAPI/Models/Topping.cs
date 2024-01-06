namespace PizzaOrderingSystemAPI.Models;

public class Topping
{
    public int ToppingId { get; set; }
    public required string Name { get; set; }
    public double CurrentPrice { get; set; }
}
