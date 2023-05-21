import { PubSub, Message } from "@google-cloud/pubsub";

const pubSubClient = new PubSub({
    keyFilename: "<INSERT FILEPATH TO GCP CREDENTIALS HERE>",
});

// main function to publish messages from a subscription to a topic
export async function republishMessages(
    subscriptionName: string,
    topicName: string,
    timeout = 3000,
    maxSimultaneousMessages = 20,
): Promise<void> {
    await pullFromSubscriptionAndProcess(
        subscriptionName,
        async (message: Message) => {
            await publishToTopic(topicName, message);
        },
        timeout,
        maxSimultaneousMessages,
    );
}

// there's no API to explicitly pull all messages enqueued in the subscription
// we must instead poll via subscribing as the code below does
async function pullFromSubscriptionAndProcess(
    subscriptionName: string,
    processMessage: (message: Message) => Promise<void>,
    timeout = 3000,
    maxSimultaneousMessages = 20,
): Promise<void> {
    let mostRecentMessageTimestamp = 0;

    const processingMessageIds = new Set<string>();
    const subscription = pubSubClient.subscription(subscriptionName, {
        flowControl: { maxMessages: maxSimultaneousMessages },
    });
    subscription.on("message", async (message: Message) => {
        try {
            mostRecentMessageTimestamp = Date.now();
            processingMessageIds.add(message.id);
            await processMessage(message);
            message.ack();
        } catch (err) {
            console.error(err);
            message.nack();
        } finally {
            processingMessageIds.delete(message.id);
        }
    });

    // initial wait
    await new Promise((resolve) => setTimeout(resolve, timeout));

    // wait for the timeout time to be hit since the last message
    // was received, also wait for all message processing to finish,
    // then finish and close the subscription
    while (getTimeSinceMostRecent() < timeout || processingMessageIds.size > 0) {
        await new Promise((resolve) => setTimeout(resolve, timeout - getTimeSinceMostRecent()));
    }
    await subscription.close();

    function getTimeSinceMostRecent() {
        return Date.now() - mostRecentMessageTimestamp;
    }
}

async function publishToTopic(topicName: string, message: Message) {
    const {
        // eslint-disable-next-line unused-imports/no-unused-vars
        publishTime, // remove previous publish time
        ...messageProperties
    } = message;

    return await pubSubClient.topic(topicName).publishMessage(messageProperties);
}
