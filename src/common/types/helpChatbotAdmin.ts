import type { LanguageId } from './common'

// Context saved with each turn (help_chatbot_turns.metadata), shown in the viewer when present. Every key is
// optional and {} is valid. The database takes any object, so turns saved by older code may have keys this
// type doesn't list; the viewer shows those as they are.
export type HelpChatbotTurnMetadata = {
  // The UI language the question was asked in, which the answer's labels follow
  uiLanguage?: LanguageId
  // During "login as", the user the admin was viewing Norppa as
  impersonatedUserId?: string
}
