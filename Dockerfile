
FROM collinestes/docker-node-oracle

RUN mkdir /test
WORKDIR /test
ADD ./* /test/
RUN chmod -R 777 /test

CMD ["./test.sh"]
