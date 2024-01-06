namespace PizzaOrderingSystemAPI.Models;

public class Size
{
    public int SizeId { get; set; }
    public required string Name { get; set; }
    public int CurrentPrice { get; set; }
}
