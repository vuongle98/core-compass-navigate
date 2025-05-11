import {
  Bot,
  BotCommand,
  BotHistory,
  BotScheduledMessage,
  BotStatistics,
} from "@/types/Bot";
import EnhancedApiService from "./EnhancedApiService";
import LoggingService from "./LoggingService";

/**
 * Service for bot related operations
 */
class BotService {
  private static API_ENDPOINT = "/api/v1/bots";

  /**
   * Get a paginated list of bot bots
   * @param params - Optional parameters for pagination and filtering
   * @returns A paginated list of bots
   */
  static async getBots(params?: Record<string, string>) {
    try {
      LoggingService.info("bot_service", "get_bots", "Fetching bots");
      return await EnhancedApiService.getPaginated<Bot>(
        this.API_ENDPOINT,
        {},
        params
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "get_bots_failed",
        "Failed to fetch bots",
        error
      );
      throw error;
    }
  }

  /**
   * Get a single bot post by ID
   * @param id - ID of the bot to fetch
   * @returns The bot object
   */
  static async getBot(id: number): Promise<Bot> {
    try {
      LoggingService.info("bot_service", "get_bot", `Fetching bot ${id}`);
      return await EnhancedApiService.get<Bot>(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "get_bot_failed",
        `Failed to fetch bot ${id}`,
        error
      );
      return {} as Bot;
    }
  }

  /**
   * Create a new bot bot
   * @param data - Bot data to create
   * @returns The created bot
   * @throws Error if the creation fails
   */
  static async createBot(data: Partial<Bot>): Promise<Bot> {
    try {
      LoggingService.info("bot_service", "create_bot", "Creating new bot");
      return await EnhancedApiService.post<Bot>(this.API_ENDPOINT, data);
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "create_bot_failed",
        "Failed to create bot",
        error
      );
      return {} as Bot;
    }
  }

  /**
   * Update an existing bot bot
   * @param id - ID of the bot to update
   * @param data - Updated bot data
   * @returns The updated bot
   * @throws Error if the update fails
   * @description This method updates an existing bot with the provided data.
   */
  static async updateBot(id: number, data: Partial<Bot>): Promise<Bot> {
    try {
      LoggingService.info("bot_service", "update_bot", `Updating bot ${id}`);
      return await EnhancedApiService.put<Bot>(
        `${this.API_ENDPOINT}/${id}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "update_bot_failed",
        `Failed to update bot ${id}`,
        error
      );
      return {} as Bot;
    }
  }

  /**
   * Delete a bot bot
   * @param id - ID of the bot to delete
   * @throws Error if the deletion fails
   * @description This method deletes a bot by its ID.
   */
  static async deleteBot(id: number): Promise<void> {
    try {
      LoggingService.info("bot_service", "delete_bot", `Deleting bot ${id}`);
      await EnhancedApiService.delete(`${this.API_ENDPOINT}/${id}`);
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "delete_bot_failed",
        `Failed to delete bot ${id}`,
        error
      );
      throw error;
    }
  }

  /**
   * Refresh the status of a bot
   * @param id - ID of the bot to refresh
   * @throws Error if the refresh fails
   * @description This method refreshes the status of a bot by its ID.
   */
  static async refreshBotStatus(id: number): Promise<void> {
    try {
      LoggingService.info(
        "bot_service",
        "refresh_bot_status",
        `Refreshing status for bot ${id}`
      );
      await EnhancedApiService.post(`${this.API_ENDPOINT}/${id}/refresh`, {});
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "refresh_bot_status_failed",
        `Failed to refresh status for bot ${id}`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle a bot action (start, stop, restart)
   * @param botId - ID of the bot
   * @param action - Action to perform (start, stop, restart)
   * @throws Error if the action fails
   */
  static async handleBotAction(botId: number, action: string) {
    try {
      LoggingService.info(
        "bot_service",
        "handle_bot_action",
        `Handling action ${action} for bot ${botId}`
      );
      await EnhancedApiService.post(`/api/v1/bots/${botId}/${action}`, {});
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "handle_bot_action_failed",
        `Failed to handle action ${action} bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Schedule a message for a bot
   * @param botId - ID of the bot
   * @param message - Message to schedule
   * @param scheduleTime - Time to schedule the message
   * @throws Error if the scheduling fails
   */
  static async scheduleMessage(
    botId: number | string,
    data: Partial<BotScheduledMessage>
  ): Promise<void> {
    try {
      LoggingService.info(
        "bot_service",
        "schedule_message",
        `Scheduling message for bot ${botId}`
      );
      await EnhancedApiService.post(`/api/v1/bots/${botId}/schedule`, data);
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "schedule_message_failed",
        `Failed to schedule message for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get scheduled messages for a bot
   * @param botId - ID of the bot
   * @returns List of scheduled messages
   * @throws Error if the fetching fails
   */
  static async getScheduledMessages(
    botId: number
  ): Promise<BotScheduledMessage[]> {
    try {
      LoggingService.info(
        "bot_service",
        "get_scheduled_messages",
        `Fetching scheduled messages for bot ${botId}`
      );
      return await EnhancedApiService.get<BotScheduledMessage[]>(
        `/api/v1/bots/${botId}/scheduled-messages`
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "get_scheduled_messages_failed",
        `Failed to fetch scheduled messages for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a scheduled message for a bot
   * @param botId - ID of the bot
   * @param messageId - ID of the scheduled message to delete
   * @throws Error if the deletion fails
   */
  static async cancelScheduledMessage(
    botId: number,
    messageId: number
  ): Promise<void> {
    try {
      LoggingService.info(
        "bot_service",
        "delete_scheduled_message",
        `Deleting scheduled message ${messageId} for bot ${botId}`
      );
      await EnhancedApiService.delete(
        `/api/v1/bots/${botId}/scheduled-messages/${messageId}/cancel`
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "delete_scheduled_message_failed",
        `Failed to delete scheduled message ${messageId} for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get bot commands for a bot
   * @param botId - ID of the bot
   * @returns List of bot commands
   * @throws Error if the fetching fails
   */
  static async getBotCommand(botId: number): Promise<BotCommand[]> {
    try {
      LoggingService.info(
        "bot_service",
        "get_bot_command",
        `Fetching bot commands for bot ${botId}`
      );
      return await EnhancedApiService.get<BotCommand[]>(
        `/api/v1/bots/${botId}/command`
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "get_bot_command_failed",
        `Failed to fetch bot commands for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new bot command
   * @param botId - ID of the bot
   * @param data - Command data to create
   * @returns The created bot command
   * @throws Error if the creation fails
   */
  static async createBotCommand(
    botId: number,
    data: Partial<BotCommand>
  ): Promise<BotCommand> {
    try {
      LoggingService.info(
        "bot_service",
        "create_bot_command",
        `Creating bot command for bot ${botId}`
      );
      return await EnhancedApiService.post<BotCommand>(
        `/api/v1/bots/${botId}/command`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "create_bot_command_failed",
        `Failed to create bot command for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Update an existing bot command
   * @param botId - ID of the bot
   * @param commandName - Name of the command to update
   * @param data - Updated command data
   * @returns The updated bot command
   * @throws Error if the update fails
   */
  static async updateBotCommand(
    botId: number,
    commandName: string,
    data: Partial<BotCommand>
  ): Promise<BotCommand> {
    try {
      LoggingService.info(
        "bot_service",
        "update_bot_command",
        `Updating bot command ${commandName} for bot ${botId}`
      );
      return await EnhancedApiService.put<BotCommand>(
        `/api/v1/bots/${botId}/command/${commandName}`,
        data
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "update_bot_command_failed",
        `Failed to update bot command ${commandName} for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a bot command
   * @param botId - ID of the bot
   * @param commandName - Name of the command to delete
   * @throws Error if the deletion fails
   */
  static async deleteBotCommand(
    botId: number,
    commandName: string
  ): Promise<void> {
    try {
      LoggingService.info(
        "bot_service",
        "delete_bot_command",
        `Deleting bot command ${commandName} for bot ${botId}`
      );
      await EnhancedApiService.delete(
        `/api/v1/bots/${botId}/command/${commandName}`
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "delete_bot_command_failed",
        `Failed to delete bot command ${commandName} for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get bot status history
   * @param botId - ID of the bot
   * @returns List of bot status history
   * @throws Error if the fetching fails
   */
  static async getBotStatusHistory(botId: number) {
    try {
      LoggingService.info(
        "bot_service",
        "get_bot_status_history",
        `Fetching bot status history for bot ${botId}`
      );
      return await EnhancedApiService.get<BotHistory[]>(
        `/api/v1/bots/${botId}/history`
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "get_bot_status_history_failed",
        `Failed to fetch bot status history for bot ${botId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get bot statistics
   * @returns Bot statistics
   * @throws Error if the fetching fails
   */
  static async getStatistics() {
    try {
      LoggingService.info(
        "bot_service",
        "get_statistics",
        "Fetching bot statistics"
      );
      return await EnhancedApiService.get<BotStatistics>(
        "/api/v1/bots/statistics"
      );
    } catch (error) {
      LoggingService.error(
        "bot_service",
        "get_statistics_failed",
        "Failed to fetch bot statistics",
        error
      );
      throw error;
    }
  }
}

export default BotService;
