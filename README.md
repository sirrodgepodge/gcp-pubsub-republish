# gcp-pubsub-republish

A script for republishing GCP Pub/Sub subscription messages to topics, made with the motivation of simplifying the replay of deadletter queue (DLQ) messages

Intended for you to take and customize for your own use.  GCP Pub/Sub implementations vary a lot and are often core to an application so my present thinking is that providing this snippet is more useful than providing a library.

Note: You will need to ensure that you have needed permissions, specifically note that your CLI "user" will need the following permissions added:

1. "Pub/Sub Subscriber" permissions to your deadletter queue subscription
2. "Pub/Sub Publisher" permissions to your main topic
this will be done using the UI depicted below:
![Screenshot 2023-05-21 at 4 45 31 PM](https://github.com/sirrodgepodge/gcp-pubsub-republish/assets/7177292/f4c39570-3631-40fc-bd6a-d8432537f8f9)

# Community implementations of this code.

- [Pubsub Deadletter Republisher](https://github.com/jgunnink/pubsub-deadletter-republisher)
  - This repository provides the tools for deploying a cloud function which implements the Typescript code here that handles the republishing.
  - You can use this repo to deploy the code as a cloud function in your own GCP projects.
