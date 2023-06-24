import winston from "winston"

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'basic.log', level: "info" }),
        new winston.transports.File({ filename: 'debug.log' }),
    ],
});

const console_format = winston.format.printf(({level, message, timestamp}) => {
    return `${timestamp} [${level}] : ${message}`
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            console_format
        ),
    }));
}

export default logger