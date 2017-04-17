# Worker

The worker is an event emitter.

## Core Events

| Event | Name                 | This event is emitted when                           |
|:------|:---------------------|:-----------------------------------------------------|
| error | Recoverable error    | An error is recovered                                |
| fatal | Unrecoverable error  | A fatal error is triggered and will not be recovered |
| end   | Process ending       | The app is ending                                    |
| exit  | Process end          | The app end                                          |

## Default Listeners

| Listeners  | Events                 | Listen for                                              | More info                 |
|:-----------|:-----------------------|:--------------------------------------------------------|---------------------------|
| dispatcher | worker.dispatch.{type} | Event that must be dispatched to all workers            | [Dispatcher](#dispatcher) |
| pidbox     | worker.pidbox.{method} | Event that must controlled another worker               | [Pidbox](#pidbox)         |
| task       | ********************** | Event that must be handle by a **Task**                 | [Pidbox](#pidbox)         |

## Available Modules

| Module    | Description                                          |
|:----------|:-----------------------------------------------------|
| Hearbeat  | Beat every n time. Can be used for regular operation |
| Presence  | Signal when the worker is online or offline          |
| Hello     | Send an hello message to all workers                 |
| Network

### Dispatcher

## Sequence

```
- [x] Assert reply.celery.pidbox
    Exchange.Declare x=reply.celery.pidbox
    Exchange.Declare-Ok

- [x] Declare Reply Queue
    Queue.Declare q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox
    Queue.Declare-Ok q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox

- [x] Bind Reply Queue
    Queue.Bind q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox x=reply.celery.pidbox bk=0f1fda37-fa9b-3497-8c57-56934e4955ac
    Queue.Bind-Ok

- [x] Assert Pidbox exist
    Exchange.Declare x=celery.pidbox
    Exchange.Declare-Ok

- [ ] Publish Worker Availability
    Basic.Publish x=celery.pidbox rk= Content-Header type=application/json Content-Body
    >> {"reply_to": {"routing_key": "0f1fda37-fa9b-3497-8c57-56934e4955ac", "exchange": "reply.celery.pidbox"}, "ticket": "9dc9cb34-7e79-488c-8a3c-43f517a502b1", "destination": null, "method": "hello", "arguments": {"revoked": {}, "from_node": "celery@Romains-MBP"}}
=
- [ ] Assert PidBox Reply exist
    Exchange.Declare x=reply.celery.pidbox
    Exchange.Declare-Ok

- [ ] Declare Reply queue
    Queue.Declare q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox
    Queue.Declare-Ok q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox

- [ ] Bind Reply Queue
    Queue.Bind q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox x=reply.celery.pidbox bk=0f1fda37-fa9b-3497-8c57-56934e4955ac
    Queue.Bind-Ok

- [ ] Consume Reply message
    Basic.Consume q=0f1fda37-fa9b-3497-8c57-56934e4955ac.reply.celery.pidbox
    Basic.Consume-Ok

- [ ] ?????
    Basic.Deliver x=reply.celery.pidbox rk=0f1fda37-fa9b-3497-8c57-56934e4955ac Content-Header type=application/json Content-Body
    Basic.Cancel
    Basic.Cancel-Ok
    Basic.Qos
    Basic.Qos-Ok
    
- [ ] Check Celery Exchange Exist
    Exchange.Declare x=celery
    Exchange.Declare-Ok

- [ ] Check Celery Queue Exist
    Queue.Declare q=celery
    Queue.Declare-Ok q=celery

- [ ] Bind Celery Queue
    Queue.Bind q=celery x=celery bk=celery
    Queue.Bind-Ok
    
- [ ] Declare Pidbox Exchange
    Exchange.Declare x=celery.pidbox
    Exchange.Declare-Ok
    
- [ ] Declare Worker pidbox
    Queue.Declare q=celery@Romains-MBP.celery.pidbox
    Queue.Declare-Ok q=celery@Romains-MBP.celery.pidbox

- [ ] Bind Worker Pidbox
    Queue.Bind q=celery@Romains-MBP.celery.pidbox x=celery.pidbox bk=
    Queue.Bind-Ok
    
- [ ] Consumer Worker Pidbox ????
    Basic.Consume q=celery@Romains-MBP.celery.pidbox
    Basic.Consume-Ok
    
- [ ] Declare celeryev exchange
    Exchange.Declare x=celeryev
    Exchange.Declare-Ok
    
- [ ] Declare worker.celeryev queue
    Queue.Declare q=celeryev.9febb6f2-96c2-42d4-bd7a-c511be2f591f
    Queue.Declare-Ok q=celeryev.9febb6f2-96c2-42d4-bd7a-c511be2f591f
    
- [ ] Bind worker.celeryev
    Queue.Bind q=celeryev.9febb6f2-96c2-42d4-bd7a-c511be2f591f x=celeryev bk=worker.#
    Queue.Bind-Ok

- [ ] Consume worker.celeryev
    Basic.Consume q=celeryev.9febb6f2-96c2-42d4-bd7a-c511be2f591f
    Basic.Consume-Ok

- [ ] Declare celeryev
    Exchange.Declare x=celeryev
    Exchange.Declare-Ok

- [ ] Publish worker online
    Basic.Publish x=celeryev rk=worker.online Content-Header type=application/json Content-Body
    Basic.Consume q=celery
    Basic.Deliver x=celeryev rk=worker.online Content-Header type=application/json Content-Body
    Basic.Consume-Ok

- [ ] Publish worker heartbeat
    Basic.Deliver x=celeryev rk=worker.heartbeat Content-Header type=application/json Content-Body

- [ ] ??????????
    Basic.Deliver x=celery.pidbox rk= Content-Header type=application/json Content-Body

- [ ] Declar Worker Offline
    Basic.Publish x=celeryev rk=worker.offline Content-Header type=application/json Content-Body

```