//requestLimitMiddleware.js
/* Load environment variables from a .env 
file using the dotenv package*/
require('dotenv').config();
//IMPORT REQUIRED MODULES AND PACKAGES
const rateLimit = require('express-rate-limit');


// REQUEST LIMIT MIDDLEWARE

/**Middleware General API rate limiterapplied to sensitive endpoints to limit 
  to 100 requests per 15 minutes per IP*/
const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',// Default message returned when the rate limit is exceeded
    standardHeaders: true,// Include standard RateLimit headers in the response
    legacyHeaders: false,// Disable the legacy X-RateLimit-* headers
    // Custom function that runs when the rate limit is exceeded
    handler: (req, res) => {
        console.warn(`[WARN: middleware.js, generalRateLimiter] Rate limit exceeded for IP: ${req.ip}`);// Log a warning message in the console for debugging purposes
        res.status(429).json({//Respond with a 429 (To many requests) status code and an error message
            success: false,// Indicate the request was unsuccessful
            message: 'Too many requests, please slow down',// User-friendly error message
            /*Calculate approximately how many minutes remain until
            the client can make requests again*/
            retryAfter: Math.ceil(
                (req.rateLimit.resetTime - Date.now()) / 1000 / 60
            ) + ' minutes'// minutes until reset
        });
    },
})

  /*Rate limiter Middleware to limit login 
requests to 5 attempts per 15 minutes per IP*/
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Define the time window for rate limiting (15 minutes)
    max: 5,// Allow a maximum of 5 failed login attempts from the same IP
    // Default message returned when the rate limit is exceeded
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
     standardHeaders: true, // Include the standard RateLimit HTTP headers
    legacyHeaders: false, // Disable the legacy X-RateLimit-* headers
    // Only count failed attempts (4xx, 5xx status codes)(status >= 400)
    skipSuccessfulRequests: true, // Successful logins do not count towards the rate limit
    handler: (req, res) => {// Custom handler executed when the login limit is exceeded
        console.warn(// Log a warning in the console showing which IP exceeded the limit
            `[WARN: middleware.js, loginRateLimiter] Rate limit exceeded for IP: ${req.ip}`
        );
        console.error(// Log an error message in console for debugging purposes
            '[ERROR: middleware.js, loginRateLimiter]:Too many login attempts from this IP, please try again after 15 minutes'
        );
        res.status(429).json({//Respond with a 429 (To many requests) status code and an error message
            success: false,
            message: 'Too many login attempts from this IP, please try again after 15 minutes',
            retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60) + ' minutes'// minutes until reset
        });
    }
})

/**Rate limiter middleware to limit registration attempts to 3 per hour per IP to
 help prevent spam account creation*/
const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // Define the time window for rate limiting (1 hour)
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: 'Too many registration attempts, please try again later',// Default message returned when the rate limit is exceeded
    standardHeaders: true,// Include the standard RateLimit HTTP headers in the response
    legacyHeaders: false,// Disable the legacy X-RateLimit-* headers
    handler: (req, res) => {// Custom function that executes when the rate limit is exceeded
        console.warn(// Log a warning in the console showing which IP address exceeded the rate limit
            `[WARN: middleware.js, registrationRateLimiter] Rate limit exceeded for IP: ${req.ip}`
        );
        res.status(429).json({//Respond with a 429 (To many requests) status code and an error message
            success: false, // Indicate that the request was unsuccessful
            message: 'Too many registration attempts from this IP, please try again in an hour',// User-friendly error message
             /*Calculate approximately how many minutes remain 
             until another password reset request can be made*/ 
            retryAfter:
                Math.ceil(
                    (req.rateLimit.resetTime - Date.now()) / 1000 / 60
                ) + ' minutes'
        });
    },
});

/*Rate limiter middleware to limit password updates*/
const passwordUpdateRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password updates per hour
    message: 'Too many password update attempts, please try again later',//Counts all password update attempts
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`[WARN: middleware.js, passwordUpdateRateLimiter] Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({//Respond with a 429 (To many requests) status code and an error message
            success: false,// Indicate that the request was unsuccessful
            message: 'Too many password update attempts, please try again in an hour',// User-friendly error message
            retryAfter: Math.ceil(// Calculate how many minutes remain before another login attempt is allowed
                (req.rateLimit.resetTime - Date.now()) / 1000 / 60
            ) + ' minutes'// minutes until reset
        });
    },
});


module.exports = {}