package config

import "os"

type Config struct {
	DatabasePath string
	JWTSecret    string
}

func Load() *Config {
	return &Config{
		DatabasePath: getEnv("DATABASE_PATH", "./cook.db"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
