# Cronjobs

Norppa backend currently runs several cronjobs, which include mailing, database view refreshing and precaching.

If future developers are interested in scaling Norppa backend to multiple instances, cron obs are the main blocker. One should then mark one instance as a master instance that runs the cronjobs.

|             Name              | Who runs |                                        Why                                        |                  When                   | Priority |
| :---------------------------: | :------: | :-------------------------------------------------------------------------------: | :-------------------------------------: | :------: |
|           `updater`           | Updater  |                                To update Sisu data                                | Depends on implementation (1.30 for hy) |  `High`  |
|          `pateCron`           |  Norppa  |                           To send daily scheduled mail                            |                  11.15                  |  `High`  |
|   `continuousFeedbackCron`    |  Norppa  |                  To send cfb digest mail to responsible teachers                  |                  8.00                   | `Medium` |
|      `refreshViewsCron`       |  Norppa  |                  To refresh course summary database views daily                   |                  6.30                   | `Medium` |
| `summariesCron` | Norppa | To refresh course summary v2 summaries-table | 5.20 | `Medium` |
| `precacheFeedbackTargetsCron` |  Norppa  | To cache feedback targets that have just opened and will soon see a visitor spike |                  3.10                   |  `Low`   |

`Critical` = failure would cause serious problems;
`High` = very important for normal operation but can be retried without a problem at a later time;
`Medium` = somewhat important, failure would lead to users missing on latest data until next run;
`Low` = performance optimization or similar: failure could lead to a slight UX degradation
