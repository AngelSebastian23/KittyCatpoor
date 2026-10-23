// CatMiau/Server.cs
using System.Collections.Generic;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Stripe;
using Stripe.Checkout;

public class StripeOptions
{
    public string option { get; set; }
}

namespace server.Controllers
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    
                    // Línea fundamental: Permite a .NET entender las rutas que le envía la Function URL de AWS Lambda
                    webBuilder.UseLambdaServer(); 
                });
    }

    public class Startup
    {
      public void ConfigureServices(IServiceCollection services)
      {
          services.AddMvc()
                  .AddNewtonsoftJson()
                  .AddApplicationPart(typeof(CheckoutApiController).Assembly);

          services.AddCors(options =>
          {
              options.AddPolicy("AllowAll", builder =>
              {
                  builder.AllowAnyOrigin()
                         .AllowAnyMethod()
                         .AllowAnyHeader();
              });
          });

          services.AddSingleton(new StripeClient(System.Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")));
      }

      public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
      {
            if (env
            .IsDevelopment()) app.UseDeveloperExceptionPage();

            app.UseCors("AllowAll");
            app.UseRouting();
            app.UseStaticFiles();
            app.UseEndpoints(endpoints => endpoints.MapControllers());
        }
    }

    public class CreateSessionRequest
    {
        public long Amount { get; set; } // Recibiremos el monto en centavos
    }

    [Route("create-checkout-session")]
    [ApiController]
    public class CheckoutApiController : Controller
    {
        private readonly StripeClient _client;

        public CheckoutApiController(StripeClient client)
        {
            _client = client;
        }

        [HttpPost]
        public ActionResult Create([FromBody] CreateSessionRequest request)
        {
            // Validación en servidor: 5 MXN (500 centavos) a 200 MXN (20000 centavos)
            if (request.Amount < 500 || request.Amount > 20000)
            {
                return BadRequest(new { error = "El monto debe estar entre 5 y 200 MXN." });
            }

            var domain = "https://d8tjzzv9pst46.cloudfront.net";
            var options = new SessionCreateOptions
            {
                UiMode = "elements",
                LineItems = new List<SessionLineItemOptions>
                {
                  new SessionLineItemOptions
                  {
                    // Usamos PriceData para montos dinámicos
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "mxn",
                        UnitAmount = request.Amount,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "Donación para el gato",
                        },
                    },
                    Quantity = 1,
                  },
                },
                Mode = "payment",
                ReturnUrl = domain + "/complete?session_id={CHECKOUT_SESSION_ID}",
            };
            
            Session session = _client.V1.Checkout.Sessions.Create(options);

            return Json(new {clientSecret = session.ClientSecret});
        }
    }

    [Route("session-status")]
    [ApiController]
    public class SessionStatusController : Controller
    {
        private readonly StripeClient _client;

        public SessionStatusController(StripeClient client)
        {
            _client = client;
        }

        [HttpGet]
        public ActionResult SessionStatus([FromQuery] string session_id)
        {
            var options = new SessionGetOptions();
            options.AddExpand("payment_intent");
            options.AddExpand("subscription");
            Session session = _client.V1.Checkout.Sessions.Get(session_id, options);

            return Json(new {status = session.Status, payment_status = session.PaymentStatus, payment_intent_id = session.PaymentIntent?.Id, payment_intent_status = session.PaymentIntent?.Status, subscription_id = session.PaymentIntent != null ? null : session.Subscription?.Id, subscription_status = session.PaymentIntent != null ? null : session.Subscription?.Status});
        }
    }
}
