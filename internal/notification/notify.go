package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"cook/internal/models"
)

type Notifier interface {
	Send(order models.Order) error
}

// Feishu webhook notification
type FeishuNotifier struct {
	WebhookURL string
}

func (f *FeishuNotifier) Send(order models.Order) error {
	var itemsText []string
	for _, item := range order.Items {
		name := item.Dish.Name
		if name == "" {
			name = fmt.Sprintf("菜品#%d", item.DishID)
		}
		itemsText = append(itemsText, fmt.Sprintf("%s x%d  ¥%.2f", name, item.Quantity, item.Price*float64(item.Quantity)))
	}

	username := "未知用户"
	if order.User.Username != "" {
		username = order.User.Username
	}

	remark := "无"
	if order.Remark != "" {
		remark = order.Remark
	}

	payload := map[string]interface{}{
		"msg_type": "interactive",
		"card": map[string]interface{}{
			"header": map[string]interface{}{
				"title": map[string]interface{}{
					"tag":     "plain_text",
					"content": "🍜 新订单提醒",
				},
				"template": "orange",
			},
			"elements": []interface{}{
				map[string]interface{}{
					"tag": "div",
					"fields": []interface{}{
						map[string]interface{}{
							"is_short": true,
							"text": map[string]interface{}{
								"tag":     "lark_md",
								"content": fmt.Sprintf("**订单号：**#%d", order.ID),
							},
						},
						map[string]interface{}{
							"is_short": true,
							"text": map[string]interface{}{
								"tag":     "lark_md",
								"content": fmt.Sprintf("**用户：**%s", username),
							},
						},
					},
				},
				map[string]interface{}{
					"tag": "div",
					"text": map[string]interface{}{
						"tag":     "lark_md",
						"content": fmt.Sprintf("**菜品明细：**\n%s", strings.Join(itemsText, "\n")),
					},
				},
				map[string]interface{}{
					"tag": "div",
					"fields": []interface{}{
						map[string]interface{}{
							"is_short": true,
							"text": map[string]interface{}{
								"tag":     "lark_md",
								"content": fmt.Sprintf("**备注：**%s", remark),
							},
						},
						map[string]interface{}{
							"is_short": true,
							"text": map[string]interface{}{
								"tag":     "lark_md",
								"content": fmt.Sprintf("**合计：¥%.2f**", order.Total),
							},
						},
					},
				},
				map[string]interface{}{
					"tag": "note",
					"elements": []interface{}{
						map[string]interface{}{
							"tag":     "plain_text",
							"content": order.CreatedAt.Format("2006-01-02 15:04:05"),
						},
					},
				},
			},
		},
	}

	return postJSON(f.WebhookURL, payload)
}

// DingTalk webhook notification
type DingTalkNotifier struct {
	WebhookURL string
}

func (d *DingTalkNotifier) Send(order models.Order) error {
	var itemsText []string
	for _, item := range order.Items {
		name := item.Dish.Name
		if name == "" {
			name = fmt.Sprintf("菜品#%d", item.DishID)
		}
		itemsText = append(itemsText, fmt.Sprintf("- %s x%d  ¥%.2f", name, item.Quantity, item.Price*float64(item.Quantity)))
	}

	username := "未知用户"
	if order.User.Username != "" {
		username = order.User.Username
	}

	remark := "无"
	if order.Remark != "" {
		remark = order.Remark
	}

	title := fmt.Sprintf("新订单 #%d", order.ID)
	text := fmt.Sprintf("### 🍜 %s\n\n"+
		"**用户：**%s\n\n"+
		"**菜品明细：**\n%s\n\n"+
		"**备注：**%s\n\n"+
		"**合计：¥%.2f**\n\n"+
		"> %s",
		title, username, strings.Join(itemsText, "\n"), remark, order.Total,
		order.CreatedAt.Format("2006-01-02 15:04:05"))

	payload := map[string]interface{}{
		"msgtype": "markdown",
		"markdown": map[string]string{
			"title": title,
			"text":  text,
		},
	}

	return postJSON(d.WebhookURL, payload)
}

func postJSON(url string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal payload: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("post request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	// Check response body for error codes (Feishu and DingTalk both return JSON with code/msg)
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err == nil {
		// Feishu: {"code": 0, "msg": "success"} on success
		if code, ok := result["code"]; ok {
			if codeF, ok := code.(float64); ok && codeF != 0 {
				msg, _ := result["msg"].(string)
				return fmt.Errorf("feishu error code %.0f: %s", codeF, msg)
			}
		}
		// DingTalk: {"errcode": 0, "errmsg": "ok"} on success
		if errcode, ok := result["errcode"]; ok {
			if codeF, ok := errcode.(float64); ok && codeF != 0 {
				errmsg, _ := result["errmsg"].(string)
				return fmt.Errorf("dingtalk error %.0f: %s", codeF, errmsg)
			}
		}
	}

	return nil
}

// NotifyAll sends order notification to all enabled channels synchronously
func NotifyAll(order models.Order, notifiers []Notifier) {
	for _, n := range notifiers {
		if err := n.Send(order); err != nil {
			log.Printf("[notification] send failed: %v", err)
		}
	}
}

// NotifyAllAsync sends order notification to all enabled channels asynchronously
func NotifyAllAsync(order models.Order, notifiers []Notifier) {
	for _, n := range notifiers {
		go func(notifier Notifier) {
			if err := notifier.Send(order); err != nil {
				log.Printf("[notification] send failed: %v", err)
			}
		}(n)
	}
}
