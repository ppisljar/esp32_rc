#include <Arduino.h>
#include <RemoteDebug.h>
#include <stdarg.h>

RemoteDebug Debug;

#define LOG_ALL 0
#define LOG_INFO 1
#define LOG_WARNING 2
#define LOG_ERROR 3

#define log(level, msg, ...) \
    Serial.printf(msg, ##__VA_ARGS__); Serial.printf("\n"); \
    if (level == LOG_ALL) rdebugAln(msg, ##__VA_ARGS__); \
    else if (level == LOG_INFO) rdebugIln(msg, ##__VA_ARGS__); \
    else if (level == LOG_WARNING) rdebugWln(msg, ##__VA_ARGS__); \
    else if (level == LOG_ERROR) rdebugEln(msg, ##__VA_ARGS__)