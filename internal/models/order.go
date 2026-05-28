package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null"`
	User      User           `json:"user" gorm:"foreignKey:UserID"`
	Status    string         `json:"status" gorm:"size:20;default:pending"` // pending, confirmed, cooking, completed, cancelled
	Total     float64        `json:"total" gorm:"not null"`
	Remark    string         `json:"remark" gorm:"size:500"`
	Items     []OrderItem    `json:"items" gorm:"foreignKey:OrderID"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type OrderItem struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	OrderID  uint    `json:"order_id" gorm:"not null"`
	DishID   uint    `json:"dish_id" gorm:"not null"`
	Dish     Dish    `json:"dish" gorm:"foreignKey:DishID"`
	Quantity int     `json:"quantity" gorm:"not null"`
	Price    float64 `json:"price" gorm:"not null"`
}
