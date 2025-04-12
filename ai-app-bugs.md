Bugs:
- Delete doesn't always navigate away
- Scroll to bottom deactivate and give a button to the user
- Autofocus input on models to avoid hitting delete and go back
- Change cookies does a full page refersh
- Generate title should be fast, don't wait for the full response 
- What happens when you refresh while a stream is in process
- gitignore knowledge-base folder - DONE
- createResource should be an API route, because of the size limit of server actions

Assistants & Search
- fetch data sources (vector stores from ai search service, assistant API, local)
- fetch knowledge base (embeddings from ai search service, assistant API, local)
- fetch resources (files from ai search service, assistant API, local)
- fetch assistants
- sync knowledge base (fetch files and embeddings from all selected stores and sync into local db)
- select assistant - done
- select search type (web, local, remote, assistant) - done
- activate tool conditionally (web search, assistant search, assistant use) - done
- select vector store (used by the assistant search)
- diagram of rag
- sqlite-vec

Chats
- search chats
- delete all chats - done but needs improvement 
- delete all resources
- refine query for knowledge base with agent
- retry button on each message
- branch messages from here

- file attachments: pdf and the other extensions - DONE
- SharePoint bulk upload

- supabase rag in postgres solution  https://supabase.com/docs/guides/ai/automatic-embeddings

CLI
- readFiles converted to cli with args
- audit codebase
- analyze code and create diagrams for docs


Tasks:
- tasks panel (summarize and create document, analyze and create PRD)
- tasks are a collection of agents and workflows

Integrations
- gitlab using git
- confluence - no API available 