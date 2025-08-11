import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// Input parameters for tools
const addTranslationKeyParams = {
  key: z.string().max(500).min(1).describe('The translation key (required)'),
  namespace: z
    .string()
    .max(128)
    .optional()
    .describe('The namespace for the translation key (optional)'),
  description: z
    .string()
    .max(500)
    .optional()
    .describe('Description for the translation key (optional)'),
  codeDescription: z
    .string()
    .max(500)
    .optional()
    .describe('Code description for the translation key (optional)'),
  charactersLimit: z
    .number()
    .int()
    .optional()
    .describe('Character limit for the translation (optional, use -1 to clear limit)'),
  tags: z
    .array(z.string())
    .max(5)
    .optional()
    .describe('Tags for the translation key (optional, max 5 tags)'),
}

const addTranslationKeysBulkParams = {
  translationKeys: z
    .array(
      z.object({
        key: z.string().max(500).min(1).describe('The translation key (required)'),
        namespace: z
          .string()
          .max(128)
          .optional()
          .describe('The namespace for the translation key (optional)'),
        description: z
          .string()
          .max(500)
          .optional()
          .describe('Description for the translation key (optional)'),
        codeDescription: z
          .string()
          .max(500)
          .optional()
          .describe('Code description for the translation key (optional)'),
        charactersLimit: z
          .number()
          .int()
          .optional()
          .describe('Character limit for the translation (optional, use -1 to clear limit)'),
        tags: z
          .array(z.string())
          .max(5)
          .optional()
          .describe('Tags for the translation key (optional, max 5 tags)'),
      })
    )
    .max(100)
    .min(1)
    .describe('Array of translation keys to create (max 100 keys)'),
}

const getTranslationsParams = {
  key: z.string().optional().describe('Filter by translation key'),
  namespace: z.string().optional().describe('Filter by namespace'),
  language: z.string().optional().describe('Filter by language'),
  text: z.string().min(3).optional().describe('Search translations by text (min 3 chars)'),
  query: z.string().min(3).optional().describe('Search translations by query (min 3 chars)'),
  textStatus: z.enum(['EMPTY', 'NOT_EMPTY', '']).optional().describe('Filter by text status'),
  customerId: z.string().optional().describe('Filter by customer ID'),
  baseOnly: z.boolean().optional().describe('Get translations without customer translations'),
  reviewStatus: z
    .enum(['REVIEWED', 'NOT_REVIEWED', ''])
    .optional()
    .describe('Filter by review status'),
  page: z.number().int().min(0).optional().describe('Page number (default: 0)'),
  size: z
    .number()
    .int()
    .min(1)
    .max(2500)
    .optional()
    .describe('Page size (default: 100, max: 2500)'),
}

const updateTranslationParams = {
  key: z.string().min(1).describe('The translation key (required)'),
  language: z.string().min(1).describe('The language key (required)'),
  text: z.string().max(65535).min(0).describe('The translation text (required)'),
  customerId: z.string().optional().describe('Customer ID for customer-specific translation'),
  namespace: z.string().optional().describe('The namespace for the translation'),
  reviewStatus: z
    .enum(['REVIEWED', 'NOT_REVIEWED'])
    .optional()
    .describe('Review status for the translation'),
}

const updateTranslationsBulkParams = {
  translations: z
    .array(
      z.object({
        key: z.string().min(1).describe('The translation key (required)'),
        language: z.string().min(1).describe('The language key (required)'),
        text: z.string().max(65535).min(0).describe('The translation text (required)'),
        customerId: z.string().optional().describe('Customer ID for customer-specific translation'),
        namespace: z.string().optional().describe('The namespace for the translation'),
        reviewStatus: z
          .enum(['REVIEWED', 'NOT_REVIEWED'])
          .optional()
          .describe('Review status for the translation'),
      })
    )
    .max(100)
    .min(1)
    .describe('Array of translations to update (max 100 translations)'),
}

const autoTranslateParams = {
  languageKeys: z
    .array(z.string())
    .optional()
    .describe(
      'Array of language keys to translate. If not provided, all languages will be translated using the last auto-translation configuration.'
    ),
  options: z
    .array(z.enum(['FORCE_REPLACE', 'AUTO_PUBLISH', 'EXCLUDE_VARIABLES', 'USE_TRANSLATION_KEYS']))
    .optional()
    .describe(
      'Options for auto-translation. FORCE_REPLACE: Overwrite existing translations. AUTO_PUBLISH: Automatically publish after translation. EXCLUDE_VARIABLES: Skip translation of variables. USE_TRANSLATION_KEYS: Use existing translation keys as context.'
    ),
}

const getLanguagesParams = {
  // No parameters needed for this endpoint
}

const server = new McpServer({
  name: 'simplelocalize-mcp',
  version: '0.1.1',
})

// Get API key from environment
const API_KEY = process.env.SIMPLELOCALIZE_API_KEY

if (!API_KEY) {
  throw new Error('SIMPLELOCALIZE_API_KEY environment variable is required')
}

// Add single translation key
server.tool(
  'add_translation_key',
  'Creates a single translation key in SimpleLocalize. This tool is used to add new translation keys to your project. A translation key is the identifier that will be used to reference this translation in your application. You can optionally provide a namespace to organize keys, descriptions for translators, and tags for categorization. This tool creates the key structure but does not add the actual translated text - that is done with the update_translation tool.',
  addTranslationKeyParams,
  async ({ key, namespace, description, codeDescription, charactersLimit, tags }) => {
    try {
      const requestBody: any = { key }

      if (namespace !== undefined) requestBody.namespace = namespace
      if (description !== undefined) requestBody.description = description
      if (codeDescription !== undefined) requestBody.codeDescription = codeDescription
      if (charactersLimit !== undefined) requestBody.charactersLimit = charactersLimit
      if (tags !== undefined) requestBody.tags = tags

      const response = await fetch('https://api.simplelocalize.io/api/v1/translation-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SimpleLocalize-Token': API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error creating translation key: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully created translation key: ${key}${namespace ? ` in namespace: ${namespace}` : ''}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating translation key: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

// Add multiple translation keys in bulk
server.tool(
  'add_translation_keys_bulk',
  'Creates multiple translation keys in SimpleLocalize in a single operation. This is more efficient than creating keys one by one when you need to add many translation keys at once. You can create up to 100 translation keys in a single request. Each key can have its own namespace, descriptions, and tags. This tool only creates the key structure - the actual translated text must be added separately using the update_translation or update_translations_bulk tools.',
  addTranslationKeysBulkParams,
  async ({ translationKeys }) => {
    try {
      const requestBody = { translationKeys }

      const response = await fetch('https://api.simplelocalize.io/api/v1/translation-keys/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SimpleLocalize-Token': API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error creating translation keys in bulk: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      const result = await response.json()
      const failures = result.data?.failures || []

      if (failures.length > 0) {
        const failureMessages = failures
          .map((f: any) => `Key: ${f.entry?.key || 'unknown'}, Error: ${f.message}`)
          .join('\n')

        return {
          content: [
            {
              type: 'text',
              text: `Bulk creation completed with some failures:\n${failureMessages}\n\nSuccessfully created: ${translationKeys.length - failures.length} keys`,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully created all ${translationKeys.length} translation keys in bulk`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating translation keys in bulk: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

// Get translations
server.tool(
  'get_translations',
  'Retrieves translations from SimpleLocalize with powerful filtering and search capabilities. This tool allows you to query existing translations using various filters such as translation key, namespace, language, text content, review status, and more. You can search for specific text within translations, filter by customer-specific translations, and paginate through results. This is useful for checking what translations already exist, finding specific translations, or auditing your translation database. The tool returns a summary of found translations with pagination information.',
  getTranslationsParams,
  async params => {
    try {
      const queryParams = new URLSearchParams()

      // Add all optional parameters if they exist
      if (params.key) queryParams.append('key', params.key)
      if (params.namespace) queryParams.append('namespace', params.namespace)
      if (params.language) queryParams.append('language', params.language)
      if (params.text) queryParams.append('text', params.text)
      if (params.query) queryParams.append('query', params.query)
      if (params.textStatus) queryParams.append('textStatus', params.textStatus)
      if (params.customerId) queryParams.append('customerId', params.customerId)
      if (params.baseOnly !== undefined) queryParams.append('baseOnly', params.baseOnly.toString())
      if (params.reviewStatus) queryParams.append('reviewStatus', params.reviewStatus)
      if (params.page !== undefined) queryParams.append('page', params.page.toString())
      if (params.size !== undefined) queryParams.append('size', params.size.toString())

      const url = `https://api.simplelocalize.io/api/v2/translations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-SimpleLocalize-Token': API_KEY,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error getting translations: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      const result = await response.json()
      const translations = result.data || []
      const pageDetails = result.pageDetails || {}

      return {
        content: [
          {
            type: 'text',
            text: `Found ${translations.length} translations${pageDetails.totalElements ? ` (total: ${pageDetails.totalElements})` : ''}${pageDetails.currentPage !== undefined ? ` (page ${pageDetails.currentPage + 1} of ${pageDetails.totalPages || 1})` : ''}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting translations: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

// Update single translation
server.tool(
  'update_translation',
  'Updates a single translation in SimpleLocalize. This tool is used to add or modify the actual translated text for a specific translation key and language combination. You can update the translation text, set review status, and specify customer-specific translations. This is the primary tool for adding actual translated content to your translation keys. The translation key must already exist (created with add_translation_key) before you can add translations to it. You can also mark translations as reviewed or not reviewed for quality control purposes.',
  updateTranslationParams,
  async ({ key, language, text, customerId, namespace, reviewStatus }) => {
    try {
      const requestBody: any = { key, language, text }

      if (customerId !== undefined) requestBody.customerId = customerId
      if (namespace !== undefined) requestBody.namespace = namespace
      if (reviewStatus !== undefined) requestBody.reviewStatus = reviewStatus

      const response = await fetch('https://api.simplelocalize.io/api/v2/translations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-SimpleLocalize-Token': API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error updating translation: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated translation: ${key} (${language})${namespace ? ` in namespace: ${namespace}` : ''}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating translation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

// Update translations in bulk
server.tool(
  'update_translations_bulk',
  'Updates multiple translations in SimpleLocalize in a single operation. This is the most efficient way to add or modify many translations at once, allowing you to update up to 100 translations in a single request. Each translation can have its own text, review status, and customer-specific settings. This tool is ideal for bulk importing translations, updating multiple language versions, or performing large-scale translation updates. The translation keys must already exist (created with add_translation_key or add_translation_keys_bulk) before you can add translations to them. This tool provides detailed feedback on any failures during the bulk update process.',
  updateTranslationsBulkParams,
  async ({ translations }) => {
    try {
      const requestBody = { translations }

      const response = await fetch('https://api.simplelocalize.io/api/v2/translations/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-SimpleLocalize-Token': API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error updating translations in bulk: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      const result = await response.json()
      const failures = result.data?.failures || []

      if (failures.length > 0) {
        const failureMessages = failures
          .map(
            (f: any) =>
              `Key: ${f.entry?.key || 'unknown'}, Language: ${f.entry?.language || 'unknown'}, Error: ${f.message}`
          )
          .join('\n')

        return {
          content: [
            {
              type: 'text',
              text: `Bulk update completed with some failures:\n${failureMessages}\n\nSuccessfully updated: ${translations.length - failures.length} translations`,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated all ${translations.length} translations in bulk`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating translations in bulk: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

// Auto-translate translations
server.tool(
  'auto_translate',
  'Creates auto-translation jobs in SimpleLocalize to automatically translate content using AI translation services. This tool allows you to translate existing translation keys into multiple languages using the last auto-translation configuration (source language, target languages, translation provider, etc.). You can specify which languages to translate or let it translate all languages. The tool supports various options like forcing replacement of existing translations, auto-publishing after translation, excluding variables, and using existing translation keys as context. This is ideal for bulk translation of untranslated content or updating existing translations with improved AI translations.',
  autoTranslateParams,
  async ({ languageKeys, options }) => {
    try {
      const requestBody: any = {}

      if (languageKeys !== undefined) requestBody.languageKeys = languageKeys
      if (options !== undefined) requestBody.options = options

      const response = await fetch('https://api.simplelocalize.io/api/v2/jobs/auto-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SimpleLocalize-Token': API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error creating auto-translation job: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      const result = await response.json()
      const jobs = result.data || []

      if (jobs.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Auto-translation job created successfully. No specific jobs returned.',
            },
          ],
        }
      }

      const jobDetails = jobs
        .map(
          (job: any) =>
            `Job ID: ${job.jobId}, Progress: ${job.progress || 0}%, State: ${job.state || 'unknown'}`
        )
        .join('\n')

      return {
        content: [
          {
            type: 'text',
            text: `Auto-translation job created successfully!\n\nJob Details:\n${jobDetails}\n\nYou can monitor the progress of these jobs using the get_jobs tool.`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating auto-translation job: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

// Get configured languages
server.tool(
  'get_languages',
  'Retrieves the list of configured languages for the SimpleLocalize project. This tool returns a list of language codes that are currently configured in your project. This is useful for ensuring you are using the correct language codes when adding or updating translations.',
  async () => {
    try {
      const response = await fetch('https://api.simplelocalize.io/api/v1/languages', {
        method: 'GET',
        headers: {
          'X-SimpleLocalize-Token': API_KEY,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: `Error getting languages: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`,
            },
          ],
        }
      }

      const result = await response.json()
      const languages = result.data || []

      if (languages.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No languages configured in your SimpleLocalize project.',
            },
          ],
        }
      }

      const languageList = languages.map((lang: any) => `${lang.key} (${lang.name})`).join(', ')

      return {
        content: [
          {
            type: 'text',
            text: `Configured languages in your SimpleLocalize project (${languages.length} total):\n${languageList}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting languages: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      }
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
