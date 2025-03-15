from typing import Any, Optional
import json
import redis
import os
from functools import wraps
import hashlib

# Initialize Redis client
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a unique cache key based on function arguments."""
    # Convert args and kwargs to a string representation
    args_str = json.dumps(args, sort_keys=True)
    kwargs_str = json.dumps(kwargs, sort_keys=True)
    
    # Create a hash of the arguments
    key = f"{prefix}:{hashlib.sha256(f'{args_str}:{kwargs_str}'.encode()).hexdigest()}"
    return key

def cache_response(ttl: int = 3600):
    """
    Cache decorator for API responses.
    
    Args:
        ttl: Time to live in seconds (default: 1 hour)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(func.__name__, *args, **kwargs)
            
            try:
                # Try to get from cache
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
                
                # If not in cache, calculate result
                result = await func(*args, **kwargs)
                
                # Cache the result
                redis_client.setex(
                    cache_key,
                    ttl,
                    json.dumps(result)
                )
                
                return result
            
            except redis.RedisError:
                # If Redis fails, just execute the function
                return await func(*args, **kwargs)
        
        return wrapper
    return decorator

def clear_cache(pattern: str = "*"):
    """Clear cache entries matching the given pattern."""
    try:
        cursor = 0
        while True:
            cursor, keys = redis_client.scan(cursor, match=pattern)
            if keys:
                redis_client.delete(*keys)
            if cursor == 0:
                break
    except redis.RedisError:
        pass  # Silently fail if Redis is unavailable

def get_cache_stats() -> dict:
    """Get cache statistics."""
    try:
        info = redis_client.info()
        return {
            "used_memory": info.get("used_memory_human", "N/A"),
            "connected_clients": info.get("connected_clients", 0),
            "total_keys": sum(1 for _ in redis_client.scan_iter("*")),
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "uptime_seconds": info.get("uptime_in_seconds", 0)
        }
    except redis.RedisError:
        return {
            "error": "Redis connection failed",
            "status": "unavailable"
        } 