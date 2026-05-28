package main

import (
	"fmt"
	"log"

	"cook/internal/config"
	"cook/internal/database"
	"cook/internal/models"

	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()
	db, err := database.Connect(cfg.DatabasePath)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate
	db.AutoMigrate(&models.User{}, &models.Category{}, &models.Dish{}, &models.Order{}, &models.OrderItem{})

	// Seed admin user
	var admin models.User
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			admin = models.User{
				Username: "admin",
				Password: "admin123",
				Role:     "admin",
			}
			admin.HashPassword()
			db.Create(&admin)
			fmt.Println("Created admin user: admin / admin123")
		}
	} else {
		fmt.Println("Admin user already exists")
	}

	// Seed categories
	categories := []models.Category{
		{Name: "热菜", SortOrder: 1},
		{Name: "凉菜", SortOrder: 2},
		{Name: "主食", SortOrder: 3},
		{Name: "汤类", SortOrder: 4},
		{Name: "饮料", SortOrder: 5},
	}
	for _, cat := range categories {
		db.FirstOrCreate(&cat, models.Category{Name: cat.Name})
	}

	// Seed dishes
	dishes := []models.Dish{
		{Name: "宫保鸡丁", Description: "经典川菜，鸡肉花生米", Price: 38, CategoryID: 1, Available: true},
		{Name: "鱼香肉丝", Description: "酸甜可口，下饭神器", Price: 35, CategoryID: 1, Available: true},
		{Name: "红烧肉", Description: "肥而不腻，入口即化", Price: 48, CategoryID: 1, Available: true},
		{Name: "清炒时蔬", Description: "新鲜时令蔬菜", Price: 22, CategoryID: 1, Available: true},
		{Name: "凉拌黄瓜", Description: "清爽开胃", Price: 12, CategoryID: 2, Available: true},
		{Name: "皮蛋豆腐", Description: "经典凉菜", Price: 15, CategoryID: 2, Available: true},
		{Name: "蛋炒饭", Description: "粒粒分明", Price: 15, CategoryID: 3, Available: true},
		{Name: "阳春面", Description: "简单美味", Price: 12, CategoryID: 3, Available: true},
		{Name: "番茄蛋汤", Description: "家常味道", Price: 15, CategoryID: 4, Available: true},
		{Name: "紫菜蛋花汤", Description: "清淡可口", Price: 12, CategoryID: 4, Available: true},
		{Name: "可乐", Description: "冰镇可口可乐", Price: 5, CategoryID: 5, Available: true},
		{Name: "橙汁", Description: "鲜榨橙汁", Price: 8, CategoryID: 5, Available: true},
	}
	for _, dish := range dishes {
		db.FirstOrCreate(&dish, models.Dish{Name: dish.Name})
	}

	fmt.Println("Seed data created successfully!")
}
