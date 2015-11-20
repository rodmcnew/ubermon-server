- - - MUST - - -
get prod server to persist to DB
dont let emails go in spam
allow multipule contacts
support "email to sms" contact type
update and remove dialogs for monitors
fix chart display when 0 or 1 pings
fix chart when too full of pings
limit the number of monitors that can be created per account
show duration in events view
show uptime percent
ACL protect remote pinger api

- - - SHOULD - - -
validate allowed intervals
go to login page if lost session
DDOS prevent - do not allow more than X monitors for the same domain
prevent being a DDOS tool (prevent pinging same site many times somehow, handle fake different url params)
clicking in url should put cursor at end if "http://" is in it
use ssl
expire accounts after 1 year of no activity? yearly renewal email link?
handle form errors without browser alert boxes
localize dates in UI
verify accounts through email? prevent DDOS account creation?
get the word "alert" in the site description and tag line
pause monitor while waiting for remote to check so don't get 2 emails on long timeouts
check for skipped seconds and email admin of load issue


- - - COULD - - -
save redirects so we don't keep following them everytime a monitor is pinged?
disable web ui on remote1.ubermon.com (disable db too?)
stop using unreliable namecheap forwareder for 'ubermon.com'
put remote pinger on a different company's network than the main engines
