package main

import (
	"log"
	"os"

	"cook/internal/config"
	"cook/internal/database"
	"cook/internal/handlers"
	"cook/internal/middleware"
	"cook/internal/models"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DatabasePath)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := db.AutoMigrate(&models.User{}, &models.Dish{}, &models.Category{}, &models.Order{}, &models.OrderItem{}, &models.Settings{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	r := gin.Default()

	// CORS middleware
	r.Use(corsMiddleware())

	// Serve static files (React build)
	r.Static("/assets", "./frontend/dist/assets")
	r.StaticFile("/", "./frontend/dist/index.html")
	r.StaticFile("/favicon.svg", "./frontend/dist/favicon.svg")
	r.StaticFile("/icons.svg", "./frontend/dist/icons.svg")
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register(db))
			auth.POST("/login", handlers.Login(db, cfg.JWTSecret))
		}

		// Public routes
		api.GET("/dishes", handlers.ListDishes(db))
		api.GET("/dishes/:id", handlers.GetDish(db))
		api.GET("/categories", handlers.ListCategories(db))

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.Auth(cfg.JWTSecret))
		{
			// User routes
			protected.POST("/orders", handlers.CreateOrder(db))
			protected.GET("/orders", handlers.ListMyOrders(db))
			protected.GET("/orders/:id", handlers.GetOrder(db))

			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(middleware.AdminOnly())
			{
				admin.POST("/dishes", handlers.CreateDish(db))
				admin.PUT("/dishes/:id", handlers.UpdateDish(db))
				admin.DELETE("/dishes/:id", handlers.DeleteDish(db))
				admin.POST("/categories", handlers.CreateCategory(db))
				admin.PUT("/categories/:id", handlers.UpdateCategory(db))
				admin.DELETE("/categories/:id", handlers.DeleteCategory(db))
				admin.GET("/orders", handlers.ListAllOrders(db))
				admin.PUT("/orders/:id/status", handlers.UpdateOrderStatus(db))
				admin.GET("/stats", handlers.GetStats(db))

				// User management
				admin.GET("/users", handlers.ListUsers(db))
				admin.DELETE("/users/:id", handlers.DeleteUser(db))
				admin.PUT("/users/:id/role", handlers.UpdateUserRole(db))

				// Settings & notifications
				admin.GET("/settings", handlers.GetSettings(db))
				admin.PUT("/settings", handlers.UpdateSettings(db))
				admin.POST("/settings/test-notification", handlers.TestNotification(db))
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on :%s", port)
	r.Run(":" + port)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
