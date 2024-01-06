using FluentValidation;

namespace PizzaOrderingSystemAPI.Validators;

public class CrupdatePizzaDtoValidator : AbstractValidator<CrupdatePizzaDto>
{
    public CrupdatePizzaDtoValidator()
    {
        RuleFor(p => p.SizeId).InclusiveBetween(1, 3);
        RuleForEach(p => p.ToppingIds).InclusiveBetween(1, 6);
    }
}
