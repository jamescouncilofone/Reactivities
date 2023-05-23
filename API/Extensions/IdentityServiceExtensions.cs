using System.Text;
using API.Services;
using Domain;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Persistence;

namespace API.Extensions
{
    public static class IdentityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, 
            IConfiguration config)
            {
                services.AddIdentityCore<AppUser>(opt => {
                    opt.Password.RequireNonAlphanumeric = false;
                    opt.User.RequireUniqueEmail = true;
                })
                .AddEntityFrameworkStores<DataContext>();

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"]));

                services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(opt => 
                    {
                        opt.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = key,
                            ValidateIssuer = false,
                            ValidateAudience = false
                        };

                        opt.Events = new JwtBearerEvents
                        {
                            OnMessageReceived = context =>
                            {
                                var accessToken = context.Request.Query["access_token"];
                                var path = context.HttpContext.Request.Path;

                                if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/chat")))
                                {
                                    context.Token = accessToken;
                                }

                                return Task.CompletedTask;
                            }
                        };
                    });

                services.AddAuthorization(opt => {
                    opt.AddPolicy("IsActivityHost", policy => {
                        policy.Requirements.Add(new IsHostRequirement());
                    });
                });

                services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

                // AddScopted means that this token service is going to be scoped to the HTTP request
                // itself. So when the HTTP request comes in we go to our account controller and 
                // request a token because we are attempting to login, then a new instance of our
                // token service will be created and when the HTTP request is finished then we will
                // dispose of TokenService.
                //
                // NOTE: services.AddTransient - scope to method.
                //       services.AddSingleton - creates the service when application starts and is
                //                               kept alive unitl the application shuts down.
                services.AddScoped<TokenService>();

                return services;
            }
    }
}