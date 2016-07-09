
FROM collinestes/docker-node-oracle

RUN mkdir /test
WORKDIR /test
ADD ./* /test

CMD ["./test.sh"]
