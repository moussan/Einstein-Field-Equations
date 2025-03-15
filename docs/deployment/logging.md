# Logging System Enhancement Plan

## 1. Elasticsearch Integration
### Implementation Steps:
1. Add Elasticsearch to docker-compose:
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.9.0
  environment:
    - discovery.type=single-node
    - ES_JAVA_OPTS=-Xms512m -Xmx512m
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
```

2. Add Elasticsearch plugin to Fluentd:
```bash
fluent-gem install fluent-plugin-elasticsearch
```

3. Configure Elasticsearch output in fluent.conf:
```ruby
<match **>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name fluentd.${tag}.%Y%m%d
  include_tag_key true
  <buffer>
    @type file
    path /fluentd/log/elasticsearch
    flush_mode interval
    retry_type exponential_backoff
    flush_interval 5s
    retry_forever false
    retry_max_interval 30
    chunk_limit_size 2M
    queue_limit_length 8
  </buffer>
</match>
```

## 2. Log Rotation and Cleanup
### Implementation Steps:
1. Add log rotation configuration:
```ruby
<system>
  <log>
    rotate_age 5
    rotate_size 10485760
  </log>
</system>
```

2. Create cleanup script (cleanup_logs.sh):
```bash
#!/bin/bash
find /fluentd/log/aggregated -type f -mtime +30 -delete
find /fluentd/log/error -type f -mtime +7 -delete
```

3. Add cron job for cleanup:
```cron
0 0 * * * /bin/bash /fluentd/scripts/cleanup_logs.sh
```

## 3. Edge Function Performance Metrics
### Implementation Steps:
1. Add custom parser for Edge Function logs:
```ruby
<source>
  @type tail
  path /fluentd/log/edge_functions/*.log
  tag edge.function
  <parse>
    @type json
    time_key timestamp
    time_format %Y-%m-%dT%H:%M:%S.%NZ
    types execution_time:float memory_usage:float
  </parse>
</source>
```

2. Add performance metrics to Prometheus:
```ruby
<match edge.function.**>
  @type prometheus
  <metric>
    name edge_function_execution_time
    type histogram
    desc Edge Function execution time in milliseconds
    <labels>
      function_name ${function_name}
      status ${status}
    </labels>
    buckets 0.1,0.5,1,2.5,5,10,25,50,100,250,500,1000
  </metric>
  <metric>
    name edge_function_memory_usage
    type gauge
    desc Edge Function memory usage in MB
    <labels>
      function_name ${function_name}
    </labels>
  </metric>
</match>
```

## 4. Rate Limiting
### Implementation Steps:
1. Add rate limiting plugin:
```bash
fluent-gem install fluent-plugin-rate_limit
```

2. Configure rate limiting:
```ruby
<filter **>
  @type rate_limit
  interval 60
  rate 1000
  burst_size 100
  key tag
  <secondary>
    @type file
    path /fluentd/log/rate_limited
    append true
  </secondary>
</filter>
```

## 5. Security Enhancements
### Implementation Steps:
1. Add log sanitization:
```ruby
<filter **>
  @type mask_sensitive
  mask_fields ["password", "token", "api_key", "secret"]
  mask_char "*"
  mask_pattern [A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}</filter>
```

2. Configure SSL for forward input:
```ruby
<source>
  @type forward
  port 24224
  bind 0.0.0.0
  <transport tls>
    cert_path /fluentd/certs/fluentd.crt
    private_key_path /fluentd/certs/fluentd.key
    client_cert_auth true
    ca_path /fluentd/certs/ca.crt
  </transport>
</source>
```

## Implementation Timeline
1. Week 1: Elasticsearch integration and basic setup
2. Week 2: Log rotation and cleanup implementation
3. Week 3: Edge Function metrics implementation
4. Week 4: Rate limiting and security enhancements

## Monitoring and Validation
1. Set up Kibana dashboards for log visualization
2. Create alerts for log processing issues
3. Monitor system resource usage
4. Validate security measures with penetration testing 