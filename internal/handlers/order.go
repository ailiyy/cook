package handlers

import (
	"net/http"
	"strconv"

	"cook/internal/models"
	"cook/internal/notification"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderItemRequest struct {
	DishID   uint `json:"dish_id" binding:"required"`
	Quantity int  `json:"quantity" binding:"required,gt=0"`
}

type CreateOrderRequest struct {
	Items  []OrderItemRequest `json:"items" binding:"required,min=1"`
	Remark string             `json:"remark"`
}

func CreateOrder(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateOrderRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID, _ := c.Get("user_id")

		var total float64
		var orderItems []models.OrderItem

		for _, item := range req.Items {
			var dish models.Dish
			if err := db.First(&dish, item.DishID).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Dish not found"})
				return
			}

			if !dish.Available {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Dish is not available"})
				return
			}

			orderItems = append(orderItems, models.OrderItem{
				DishID:   item.DishID,
				Quantity: item.Quantity,
				Price:    dish.Price,
			})

			total += dish.Price * float64(item.Quantity)
		}

		order := models.Order{
			UserID: userID.(uint),
			Status: "pending",
			Total:  total,
			Remark: req.Remark,
			Items:  orderItems,
		}

		if err := db.Create(&order).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
			return
		}

		// Reload with associations
		db.Preload("Items.Dish").Preload("User").First(&order, order.ID)

		// Send notifications asynchronously
		go func() {
			notifiers := loadNotifiers(db)
			if len(notifiers) > 0 {
				notification.NotifyAllAsync(order, notifiers)
			}
		}()

		c.JSON(http.StatusCreated, order)
	}
}

func ListMyOrders(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _ := c.Get("user_id")

		var orders []models.Order
		if err := db.Where("user_id = ?", userID).
			Preload("Items.Dish").
			Order("created_at DESC").
			Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}

		c.JSON(http.StatusOK, orders)
	}
}

func GetOrder(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		userID, _ := c.Get("user_id")
		role, _ := c.Get("role")

		var order models.Order
		query := db.Preload("Items.Dish").Preload("User")

		if role.(string) != "admin" {
			query = query.Where("user_id = ?", userID)
		}

		if err := query.First(&order, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		c.JSON(http.StatusOK, order)
	}
}

func ListAllOrders(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var orders []models.Order

		query := db.Preload("Items.Dish").Preload("User")

		if status := c.Query("status"); status != "" {
			query = query.Where("status = ?", status)
		}

		if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}

		c.JSON(http.StatusOK, orders)
	}
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending confirmed cooking completed cancelled"`
}

func UpdateOrderStatus(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		var req UpdateStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var order models.Order
		if err := db.First(&order, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		order.Status = req.Status
		if err := db.Save(&order).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
			return
		}

		c.JSON(http.StatusOK, order)
	}
}

func loadNotifiers(db *gorm.DB) []notification.Notifier {
	var settings []models.Settings
	db.Find(&settings)

	m := make(map[string]string)
	for _, s := range settings {
		m[s.Key] = s.Value
	}

	var notifiers []notification.Notifier

	if m["feishu_enabled"] == "true" && m["feishu_webhook_url"] != "" {
		notifiers = append(notifiers, &notification.FeishuNotifier{WebhookURL: m["feishu_webhook_url"]})
	}
	if m["dingtalk_enabled"] == "true" && m["dingtalk_webhook_url"] != "" {
		notifiers = append(notifiers, &notification.DingTalkNotifier{WebhookURL: m["dingtalk_webhook_url"]})
	}

	return notifiers
}

func GetStats(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var totalOrders int64
		var totalRevenue float64
		var pendingOrders int64
		var completedOrders int64

		db.Model(&models.Order{}).Count(&totalOrders)
		db.Model(&models.Order{}).Where("status != ?", "cancelled").Select("COALESCE(SUM(total), 0)").Scan(&totalRevenue)
		db.Model(&models.Order{}).Where("status = ?", "pending").Count(&pendingOrders)
		db.Model(&models.Order{}).Where("status = ?", "completed").Count(&completedOrders)

		c.JSON(http.StatusOK, gin.H{
			"total_orders":     totalOrders,
			"total_revenue":    totalRevenue,
			"pending_orders":   pendingOrders,
			"completed_orders": completedOrders,
		})
	}
}
