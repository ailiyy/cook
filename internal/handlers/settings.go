package handlers

import (
	"net/http"
	"strings"
	"time"

	"cook/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var settingKeys = []string{
	"feishu_webhook_url",
	"feishu_enabled",
	"dingtalk_webhook_url",
	"dingtalk_enabled",
}

func GetSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var settings []models.Settings
		db.Find(&settings)

		result := make(map[string]string)
		for _, s := range settings {
			result[s.Key] = s.Value
		}
		// Ensure all keys exist
		for _, key := range settingKeys {
			if _, ok := result[key]; !ok {
				result[key] = ""
			}
		}

		c.JSON(http.StatusOK, result)
	}
}

type UpdateSettingsRequest struct {
	Settings map[string]string `json:"settings" binding:"required"`
}

func UpdateSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req UpdateSettingsRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		for key, value := range req.Settings {
			var setting models.Settings
			if err := db.Where("key = ?", key).First(&setting).Error; err != nil {
				// Create new
				setting = models.Settings{Key: key, Value: value}
				db.Create(&setting)
			} else {
				setting.Value = value
				db.Save(&setting)
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Settings updated"})
	}
}

func TestNotification(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		notifiers := loadNotifiers(db)
		if len(notifiers) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请先启用至少一个通知渠道"})
			return
		}

		testOrder := models.Order{
			ID:     0,
			Status: "pending",
			Total:  99.00,
			Remark: "这是一条测试通知",
			User:   models.User{Username: "测试用户"},
			Items: []models.OrderItem{
				{DishID: 1, Dish: models.Dish{Name: "测试菜品"}, Quantity: 2, Price: 25.00},
				{DishID: 2, Dish: models.Dish{Name: "测试饮品"}, Quantity: 1, Price: 49.00},
			},
			CreatedAt: time.Now(),
		}

		// Synchronous send so we can report errors back
		var errs []string
		for _, n := range notifiers {
			if err := n.Send(testOrder); err != nil {
				errs = append(errs, err.Error())
			}
		}

		if len(errs) > 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": strings.Join(errs, "; ")})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "测试通知发送成功"})
	}
}
