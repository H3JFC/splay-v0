.PHONY: all help deps build recv serve ecr_login push

ENV ?= production
COMMIT := $(shell git rev-parse --short HEAD)
IMAGE_NAME ?= splay-app
ECR := ${SPLAY_ECR}

all: help

help:
	@echo "Usage:"
	@echo "  make help"
	@echo "  make build"
	@echo "  make recv"
	@echo "  make serve"
	@echo "  make ecr_login"
	@echo "  make push"

deps:
	@hash go > /dev/null 2>&1 || (echo "Install go to continue: https://github.com/golang/go"; exit 1)
	@hash docker > /dev/null 2>&1 || (echo "Install docker to continue: https://docs.docker.com/engine/install/"; exit 1)
	@hash aws > /dev/null 2>&1 || (echo "Install aws to continue: https://aws.amazon.com/cli/"; exit 1)
	@hash air > /dev/null 2>&1 || (echo "Install air to continue: https://github.com/air-verse/air"; exit 1)
	@hash templ > /dev/null 2>&1 || (echo "Install templ to continue: https://templ.guide/quick-start/installation"; exit 1)

build: deps
	docker build -t ${IMAGE_NAME} -f Dockerfile ../; \
	docker tag ${IMAGE_NAME}:latest ${ECR}/${IMAGE_NAME}:latest; \
	docker tag ${IMAGE_NAME}:latest ${ECR}/${IMAGE_NAME}:${COMMIT};

recv: deps
	go run cmd/recv/main.go

serve: deps
	air -c .air.toml

ecr_login: deps
	aws ecr get-login-password --region us-east-1 | \
		docker login --username AWS --password-stdin ${ECR}

push: deps ecr_login build
	docker push ${ECR}/${IMAGE_NAME}:latest; \
	docker push ${ECR}/${IMAGE_NAME}:${COMMIT};
