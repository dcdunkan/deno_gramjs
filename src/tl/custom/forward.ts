import { ChatGetter } from "./chat_getter.ts";
import { SenderGetter } from "./sender_getter.ts";
import { Api } from "../api.js";
import { returnBigInt } from "../../helpers.ts";
import { EntityType_, entityType_ } from "../../tl/helpers.ts";
import { getPeerId } from "../../utils.ts";
import { getEntityPair_ } from "../../entity_cache.ts";
import { AbstractTelegramClient } from "../../client/abstract_telegram_client.ts";

export class Forward extends SenderGetter {
  private originalFwd: Api.MessageFwdHeader;

  constructor(
    client: AbstractTelegramClient,
    original: Api.MessageFwdHeader,
    entities: Map<string, Api.TypeEntity>,
  ) {
    super();
    // contains info for the original header sent by telegram.
    this.originalFwd = original;

    let senderId = undefined;
    let sender = undefined;
    let inputSender = undefined;
    let peer = undefined;
    // deno-lint-ignore no-unused-vars
    let chat = undefined;
    let inputChat = undefined;
    if (original.fromId) {
      const ty = entityType_(original.fromId);
      if (ty === EntityType_.USER) {
        senderId = getPeerId(original.fromId);
        [sender, inputSender] = getEntityPair_(
          senderId,
          entities,
          client._entityCache,
        );
      } else if (ty === EntityType_.CHANNEL || ty === EntityType_.CHAT) {
        peer = original.fromId;
        [chat, inputChat] = getEntityPair_(
          getPeerId(peer),
          entities,
          client._entityCache,
        );
      }
    }
    ChatGetter.initChatClass(this, {
      chatPeer: peer,
      inputChat: inputChat,
    });
    SenderGetter.initSenderClass(this, {
      senderId: senderId ? returnBigInt(senderId) : undefined,
      sender: sender,
      inputSender: inputSender,
    });
    this._client = client;
  }
}

export interface Forward extends ChatGetter, SenderGetter {}
