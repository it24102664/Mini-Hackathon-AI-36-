using HealthBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthBridge.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // 1. Ensure migrations are applied or schema is upgraded safely
        try
        {
            await context.Database.MigrateAsync();
        }
        catch
        {
            // If already migrated or schema conflict, fall back to EnsureCreated
            await context.Database.EnsureCreatedAsync();
        }

        // Apply any schema updates defensively for PostgreSQL
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PhoneNumber"" character varying(20);
                ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Address"" character varying(250);

                ALTER TABLE ""Medicines"" ADD COLUMN IF NOT EXISTS ""MinStockLevel"" integer DEFAULT 10;
                ALTER TABLE ""Medicines"" ADD COLUMN IF NOT EXISTS ""IsActive"" boolean DEFAULT true;

                CREATE TABLE IF NOT EXISTS ""Orders"" (
                    ""Id"" SERIAL PRIMARY KEY,
                    ""CustomerId"" integer NOT NULL REFERENCES ""Users""(""Id"") ON DELETE RESTRICT,
                    ""OrderDate"" timestamp with time zone NOT NULL,
                    ""TotalAmount"" numeric(18,2) NOT NULL,
                    ""Status"" character varying(50) NOT NULL,
                    ""PrescriptionUrl"" character varying(500),
                    ""PrescriptionStatus"" character varying(50) NOT NULL,
                    ""PharmacistNotes"" character varying(1000),
                    ""ShippingAddress"" character varying(250),
                    ""ContactPhone"" character varying(50),
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""UpdatedAt"" timestamp with time zone
                );

                CREATE TABLE IF NOT EXISTS ""OrderItems"" (
                    ""Id"" SERIAL PRIMARY KEY,
                    ""OrderId"" integer NOT NULL REFERENCES ""Orders""(""Id"") ON DELETE CASCADE,
                    ""MedicineId"" integer NOT NULL REFERENCES ""Medicines""(""Id"") ON DELETE RESTRICT,
                    ""UnitPrice"" numeric(18,2) NOT NULL,
                    ""Quantity"" integer NOT NULL,
                    ""Subtotal"" numeric(18,2) NOT NULL
                );
            ");
        }
        catch
        {
            // Silently ignore if tables/columns exist or handled
        }

        // 2. Seed Admin Accounts
        if (!await context.Users.AnyAsync(u => u.Email == "admin@medistock.com"))
        {
            context.Users.Add(new User
            {
                FullName = "System Admin",
                Email = "admin@medistock.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin,
                PhoneNumber = "0771234567",
                Address = "MediStock HQ, Colombo",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!await context.Users.AnyAsync(u => u.Email == "nirwan@gmail.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Nirwan Admin",
                Email = "nirwan@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("nirwan123"),
                Role = UserRole.Admin,
                PhoneNumber = "0779998877",
                Address = "Colombo, Sri Lanka",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        // 3. Seed Pharmacist Account
        if (!await context.Users.AnyAsync(u => u.Email == "pharmacist@medistock.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Sarah Jenkins (Lead Pharmacist)",
                Email = "pharmacist@medistock.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pharmacist123!"),
                Role = UserRole.Pharmacist,
                PhoneNumber = "0714567890",
                Address = "MediStock Pharmacy Branch 1",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        // 4. Seed Customer Account
        if (!await context.Users.AnyAsync(u => u.Email == "customer@medistock.com"))
        {
            context.Users.Add(new User
            {
                FullName = "Alice Johnson",
                Email = "customer@medistock.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123!"),
                Role = UserRole.Customer,
                PhoneNumber = "0751122334",
                Address = "45 Galle Road, Colombo 03",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        // 5. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new Category { Name = "Antibiotics", Description = "Medications that fight bacterial infections.", CreatedAt = DateTime.UtcNow },
                new Category { Name = "Cardiovascular", Description = "Medications for heart, blood pressure, and cholesterol.", CreatedAt = DateTime.UtcNow },
                new Category { Name = "Pain Relief & Anti-Inflammatory", Description = "Analgesics, NSAIDs, and pain management solutions.", CreatedAt = DateTime.UtcNow },
                new Category { Name = "Vitamins & Supplements", Description = "Nutritional supplements, immune boosters, and wellness vitamins.", CreatedAt = DateTime.UtcNow },
                new Category { Name = "Respiratory & Allergy", Description = "Asthma inhalers, antihistamines, and decongestants.", CreatedAt = DateTime.UtcNow },
                new Category { Name = "Diabetes Care", Description = "Insulins, blood sugar management, and test accessories.", CreatedAt = DateTime.UtcNow }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // 6. Seed Medicines with realistic data for Stock Management & Alerts
        if (!await context.Medicines.AnyAsync())
        {
            var cats = await context.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);

            var antibioticsId = cats.ContainsKey("Antibiotics") ? cats["Antibiotics"] : 1;
            var cardioId = cats.ContainsKey("Cardiovascular") ? cats["Cardiovascular"] : 1;
            var painId = cats.ContainsKey("Pain Relief & Anti-Inflammatory") ? cats["Pain Relief & Anti-Inflammatory"] : 1;
            var vitaminId = cats.ContainsKey("Vitamins & Supplements") ? cats["Vitamins & Supplements"] : 1;
            var allergyId = cats.ContainsKey("Respiratory & Allergy") ? cats["Respiratory & Allergy"] : 1;

            var medicines = new List<Medicine>
            {
                new Medicine
                {
                    Name = "Amoxicillin 500mg",
                    CategoryId = antibioticsId,
                    Description = "Broad-spectrum penicillin antibiotic used for bacterial infections.",
                    Price = 450.00m,
                    StockQuantity = 80,
                    MinStockLevel = 25,
                    ExpiryDate = DateTime.UtcNow.AddMonths(14),
                    RequiresPrescription = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Azithromycin 250mg",
                    CategoryId = antibioticsId,
                    Description = "Antibiotic used to treat respiratory infections, ear infections, and skin conditions.",
                    Price = 850.00m,
                    StockQuantity = 8, // LOW STOCK ALERT (8 <= 15)
                    MinStockLevel = 15,
                    ExpiryDate = DateTime.UtcNow.AddMonths(9),
                    RequiresPrescription = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Atorvastatin 20mg",
                    CategoryId = cardioId,
                    Description = "Lowers lipid and cholesterol levels, reducing heart attack risk.",
                    Price = 620.00m,
                    StockQuantity = 45,
                    MinStockLevel = 20,
                    ExpiryDate = DateTime.UtcNow.AddDays(18), // EXPIRING SOON ALERT (< 30 days)
                    RequiresPrescription = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Amlodipine 5mg",
                    CategoryId = cardioId,
                    Description = "Calcium channel blocker used to lower blood pressure.",
                    Price = 380.00m,
                    StockQuantity = 120,
                    MinStockLevel = 30,
                    ExpiryDate = DateTime.UtcNow.AddMonths(20),
                    RequiresPrescription = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Paracetamol 500mg Tablets",
                    CategoryId = painId,
                    Description = "Fast-acting pain reliever and fever reducer.",
                    Price = 120.00m,
                    StockQuantity = 300,
                    MinStockLevel = 50,
                    ExpiryDate = DateTime.UtcNow.AddYears(2),
                    RequiresPrescription = false, // Over the counter
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Ibuprofen 400mg",
                    CategoryId = painId,
                    Description = "Nonsteroidal anti-inflammatory drug (NSAID) for headache, muscular aches, and fever.",
                    Price = 280.00m,
                    StockQuantity = 4, // LOW STOCK ALERT (4 <= 20)
                    MinStockLevel = 20,
                    ExpiryDate = DateTime.UtcNow.AddMonths(12),
                    RequiresPrescription = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Vitamin C 1000mg Effervescent",
                    CategoryId = vitaminId,
                    Description = "Immune support dietary supplement with zinc and antioxidants.",
                    Price = 950.00m,
                    StockQuantity = 60,
                    MinStockLevel = 15,
                    ExpiryDate = DateTime.UtcNow.AddMonths(16),
                    RequiresPrescription = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Medicine
                {
                    Name = "Cetirizine 10mg",
                    CategoryId = allergyId,
                    Description = "Non-drowsy antihistamine for hay fever, allergic rhinitis, and hives.",
                    Price = 210.00m,
                    StockQuantity = 95,
                    MinStockLevel = 20,
                    ExpiryDate = DateTime.UtcNow.AddMonths(8),
                    RequiresPrescription = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Medicines.AddRange(medicines);
        }

        await context.SaveChangesAsync();
    }
}
