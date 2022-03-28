## News Collector

### How to run in a Docker container

```
$ docker build -t news-collector:latest .

$ docker run -d --name news-collector --network news-network \
-e AWS_ACCOUNT_ID='${AWS_ACCOUNT_ID}' \
-e AWS_ACCESS_KEY_ID='${AWS_ACCESS_KEY_ID}' \
-e AWS_SECRET_ACCESS_KEY='${AWS_SECRET_ACCESS_KEY}' \
news-collector:latest
```