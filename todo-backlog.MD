MUST
----------
get prod server to persist to DB
dont let emails go in spam
allow multipule contacts
support "email to sms" contact type
update and remove dialogs for monitors
fix chart display when 0 or 1 pings
fix chart when too full of pings
validate account number of monitors limit
show duration in events view
show uptime percent
validate - don't allow creation of monitors for "down" sites
validate - don't allow invalid urls

SHOULD
----------
ACL protect remote pinger api
go to login page if lost session
DDOS prevent - do not allow more than X monitors for the same domain
prevent being a DDOS tool (prevent pinging same site many times somehow, handle fake different url params)
clicking in url should put cursor at end if "http://" is in it
use ssl
expire accounts after 1 year of no activity? yearly renewal email link?
handle form errors without browser alert boxes
localize dates in UI
require email confirmation? maybe just for more than 5 monitors or 1 week of service.
get the word "alert" in the site description and tag line
pause monitor while waiting for remote to check so don't get 2 emails on long timeouts
check for skipped seconds and email admin of load issue
allow reset stats
fix bug where another monitor's chart shows if current monitor has not pings

COULD
----------
validate allowed intervals server side
ask if they want to fix redirects when monitor is created to reduce load
Translate HTTP number codes to their descriptions in UI, also translate node request error codes
save redirects so we don't keep following them everytime a monitor is pinged?
disable web ui on remote1.ubermon.com (disable db too?)
stop using unreliable namecheap forwareder for 'ubermon.com'
put remote pinger on a different company's network than the main engines

WOULD
----------
have client refresh fast after changes but slow down later to reduce load
login with facebook and/or google
validate - don't allow domains that do not exist
clean up inline styles and br tags
allow access to dashboard before creating account?
