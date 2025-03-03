using Microsoft.AspNetCore.Mvc;
using Planca.API.Middleware;
using Planca.Application;
using Planca.Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add Controllers
builder.Services.AddControllers();

// Configure API behavior options
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Planca API", Version = "v1" });
});

// Add HTTP Context Accessor
builder.Services.AddHttpContextAccessor();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:3000") // Frontend URL
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    // The default HSTS value is 30 days.
    app.UseHsts();
}

// Use custom exception handler middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Add tenant resolution middleware
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowSpecificOrigin");

// Add authentication & authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();