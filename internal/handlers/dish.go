package handlers

import (
	"net/http"
	"strconv"

	"cook/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DishRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	ImageURL    string  `json:"image_url"`
	CategoryID  uint    `json:"category_id" binding:"required"`
	Available   *bool   `json:"available"`
}

func ListDishes(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dishes []models.Dish
		query := db.Preload("Category")

		if categoryID := c.Query("category_id"); categoryID != "" {
			query = query.Where("category_id = ?", categoryID)
		}

		if available := c.Query("available"); available != "" {
			query = query.Where("available = ?", available == "true")
		}

		if err := query.Order("id ASC").Find(&dishes).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dishes"})
			return
		}

		c.JSON(http.StatusOK, dishes)
	}
}

func GetDish(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid dish ID"})
			return
		}

		var dish models.Dish
		if err := db.Preload("Category").First(&dish, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Dish not found"})
			return
		}

		c.JSON(http.StatusOK, dish)
	}
}

func CreateDish(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req DishRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		dish := models.Dish{
			Name:        req.Name,
			Description: req.Description,
			Price:       req.Price,
			ImageURL:    req.ImageURL,
			CategoryID:  req.CategoryID,
			Available:   true,
		}

		if req.Available != nil {
			dish.Available = *req.Available
		}

		if err := db.Create(&dish).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create dish"})
			return
		}

		c.JSON(http.StatusCreated, dish)
	}
}

func UpdateDish(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid dish ID"})
			return
		}

		var dish models.Dish
		if err := db.First(&dish, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Dish not found"})
			return
		}

		var req DishRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		dish.Name = req.Name
		dish.Description = req.Description
		dish.Price = req.Price
		dish.ImageURL = req.ImageURL
		dish.CategoryID = req.CategoryID
		if req.Available != nil {
			dish.Available = *req.Available
		}

		if err := db.Save(&dish).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update dish"})
			return
		}

		c.JSON(http.StatusOK, dish)
	}
}

func DeleteDish(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid dish ID"})
			return
		}

		if err := db.Delete(&models.Dish{}, id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dish"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Dish deleted"})
	}
}
