import { Kafka, type Producer } from "kafkajs";

let producer: Producer;

export function getKafkaProducer(): Producer {
  if (!producer) {
    const kafka = new Kafka({
      clientId: "file-manager",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });
    producer = kafka.producer();
  }
  return producer;
}

export async function connectKafka(): Promise<void> {
  const kafkaProducer = getKafkaProducer();
  await kafkaProducer.connect();
  console.log("Connected to Kafka");
}

export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    console.log("Disconnected from Kafka");
  }
}
