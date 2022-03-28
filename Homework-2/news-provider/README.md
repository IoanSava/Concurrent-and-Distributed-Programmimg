## News Provider

### How to run in a Docker container

```
$ docker network create news-network

$ docker build -t news-provider:latest .

$ docker run -d --name news-provider --network news-network news-provider:latest
```