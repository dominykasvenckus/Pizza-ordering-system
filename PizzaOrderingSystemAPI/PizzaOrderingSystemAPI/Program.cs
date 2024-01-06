using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaOrderingSystemAPI;
using PizzaOrderingSystemAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseInMemoryDatabase("PizzaOrderingSystemDb");
});
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddScoped<DbSeeder>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler(c => c.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    if (exception is not null)
    {
        if (exception is BadHttpRequestException)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "The request body contains invalid JSON." });
        }
        else
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { error = "An internal server error occurred." });
        }
    }
}));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("api/v1/pizzas", async (ApplicationDbContext db) =>
{
    var pizzas = await db.Pizzas
        .Include(p => p.Size)
        .Include(p => p.Toppings)
        .ToListAsync();
    return Results.Ok(pizzas);
}).WithName("GetPizzas")
  .Produces<List<Pizza>>(200)
  .WithOpenApi();

app.MapGet("api/v1/pizzas/{pizzaId:int}", async (ApplicationDbContext db, int pizzaId) =>
{
    var pizza = await db.Pizzas
        .Include(p => p.Size)
        .Include(p => p.Toppings)
        .FirstOrDefaultAsync(p => p.PizzaId == pizzaId);
    if (pizza is null)
    {
        return Results.NotFound(new { error = "The requested pizza was not found." });
    }
    return Results.Ok(pizza);
}).WithName("GetPizza")
  .Produces<Pizza>(200)
  .Produces(404)
  .WithOpenApi();

app.MapPost("api/v1/pizzas", async (ApplicationDbContext db, IValidator<CrupdatePizzaDto> validator, [FromBody] CrupdatePizzaDto crupdatePizzaDto) =>
{
    var validationResult = await validator.ValidateAsync(crupdatePizzaDto);
    if (!validationResult.IsValid)
    {
        return Results.UnprocessableEntity(validationResult.Errors.Select(e => new { error = e.ErrorMessage }));
    }
    var size = await db.Sizes.FirstOrDefaultAsync(s => s.SizeId == crupdatePizzaDto.SizeId);
    var toppings = await db.Toppings
        .Where(t => crupdatePizzaDto.ToppingIds.Contains(t.ToppingId))
        .ToListAsync();
    var description = toppings.Count > 0 
        ? $"{size!.Name} pizza with {string.Join(", ", toppings.Select(t => t.Name.ToLower()))}."
        : $"{size!.Name} pizza.";
    var orderPrice = toppings.Count > 3
        ? Math.Round((size!.CurrentPrice + toppings.Sum(t => t.CurrentPrice)) * 0.9, 2)
        : Math.Round(size!.CurrentPrice + toppings.Sum(t => t.CurrentPrice), 2);
    var pizza = new Pizza
    {
        Description = description,
        OrderPrice = orderPrice,
        Size = size,
        Toppings = toppings
    };
    db.Pizzas.Add(pizza);
    await db.SaveChangesAsync();
    return Results.CreatedAtRoute("GetPizza", new { pizzaId = pizza.PizzaId }, pizza);
}).WithName("CreatePizza")
  .Produces<Pizza>(201)
  .Produces(422)
  .WithOpenApi();

app.MapPut("api/v1/pizzas/{pizzaId:int}", async (ApplicationDbContext db, int pizzaId, IValidator<CrupdatePizzaDto> validator, [FromBody] CrupdatePizzaDto crupdatePizzaDto) =>
{
    var pizza = await db.Pizzas
        .Include(p => p.Size)
        .Include(p => p.Toppings)
        .FirstOrDefaultAsync(p => p.PizzaId == pizzaId);
    if (pizza is null)
    {
        return Results.NotFound(new { error = "The requested pizza was not found." });
    }
    var validationResult = await validator.ValidateAsync(crupdatePizzaDto);
    if (!validationResult.IsValid)
    {
        return Results.UnprocessableEntity(validationResult.Errors.Select(e => new { error = e.ErrorMessage }));
    }
    var size = await db.Sizes.FirstOrDefaultAsync(s => s.SizeId == crupdatePizzaDto.SizeId);
    var toppings = await db.Toppings
        .Where(t => crupdatePizzaDto.ToppingIds.Contains(t.ToppingId))
        .ToListAsync();
    var description = toppings.Count > 0
        ? $"{size!.Name} pizza with {string.Join(", ", toppings.Select(t => t.Name.ToLower()))}."
        : $"{size!.Name} pizza.";
    var orderPrice = toppings.Count > 3
        ? Math.Round((size!.CurrentPrice + toppings.Sum(t => t.CurrentPrice)) * 0.9, 2)
        : Math.Round(size!.CurrentPrice + toppings.Sum(t => t.CurrentPrice), 2);
    pizza.Description = description;
    pizza.OrderPrice = orderPrice;
    pizza.Size = size;
    pizza.Toppings = toppings;
    db.Pizzas.Update(pizza);
    await db.SaveChangesAsync();
    return Results.CreatedAtRoute("GetPizza", new { pizzaId = pizza.PizzaId }, pizza);
}).WithName("UpdatePizza")
  .Produces<Pizza>(201)
  .Produces(404)
  .Produces(422)
  .WithOpenApi();

app.MapPut("api/v1/pizzas/{pizzaId:int}/order", async (ApplicationDbContext db, int pizzaId) =>
{
    var pizza = await db.Pizzas
        .Include(p => p.Size)
        .Include(p => p.Toppings)
        .FirstOrDefaultAsync(p => p.PizzaId == pizzaId);
    if (pizza is null)
    {
        return Results.NotFound(new { error = "The requested pizza was not found." });
    }
    pizza.OrderPrice = pizza.Toppings.Count > 3
        ? Math.Round((pizza.Size.CurrentPrice + pizza.Toppings.Sum(t => t.CurrentPrice)) * 0.9, 2)
        : Math.Round(pizza.Size.CurrentPrice + pizza.Toppings.Sum(t => t.CurrentPrice), 2);
    pizza.OrderedAt = DateTime.Now;
    db.Pizzas.Update(pizza);
    await db.SaveChangesAsync();
    return Results.Ok(pizza);
}).WithName("OrderPizza")
  .Produces<Pizza>(200)
  .Produces(404)
  .WithOpenApi();

app.MapDelete("api/v1/pizzas/{pizzaId:int}", async (ApplicationDbContext db, int pizzaId) =>
{
    var pizza = await db.Pizzas
        .Include(p => p.Size)
        .Include(p => p.Toppings)
        .FirstOrDefaultAsync(p => p.PizzaId == pizzaId);
    if (pizza is null)
    {
        return Results.NotFound(new { error = "The requested pizza was not found." });
    }
    db.Pizzas.Remove(pizza);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).WithName("DeletePizza")
  .Produces(204)
  .Produces(404);

app.MapGet("api/v1/sizes", async (ApplicationDbContext db) =>
{
    var sizes = await db.Sizes.ToListAsync();
    return Results.Ok(sizes);
}).WithName("GetSizes")
  .Produces<List<Size>>(200)
  .WithOpenApi();

app.MapGet("api/v1/toppings", async (ApplicationDbContext db) =>
{
    var toppings = await db.Toppings.ToListAsync();
    return Results.Ok(toppings);
}).WithName("GetToppings")
  .Produces<List<Topping>>(200)
  .WithOpenApi();

using var scope = app.Services.CreateScope();

var dbSeeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();
await dbSeeder.SeedAsync();

app.Run();
