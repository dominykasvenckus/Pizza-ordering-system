namespace PizzaOrderingSystemAPI.Models;

public class Pizza
{
    public int PizzaId { get; set; }
    public required string Description { get; set; }
    public double OrderPrice { get; set; }
    public DateTime? OrderedAt { get; set; }
    public required Size Size { get; set; }
    public required List<Topping> Toppings { get; set; }
}
