# Deleted tables

Aka. tables that are no longer referenced in code and are not created in migrations (dangling tables?).

To make it clear which database tables are no longer in use, we list them here.

|          Table name           |                                Comment                                 |
| :---------------------------: | :--------------------------------------------------------------------: |
| `feedback_target_date_checks` | was used for the admin only feature of the same name which was removed |

This means that if your database is so old that it includes any of these tables, you should be able to freely drop them.

## How to delete a table

If a feature using some database table is completely removed, you probably want to remove all code related to it.
Best way of course is to do a project wide word-search for the model and table name.

This includes the migrations that created and edited the table.

After all references are deleted and the table is no longer created in migrations, it may be added to this list.
