MUST
----------
validate account number of monitors limits
get prod server to persist to DB
don't let emails go in spam
fix chart when too full of pings
pages for privacy policy, terms and conditions

SHOULD
----------
validate urls server side
support keyword monitor type
support "email to sms" contact type
auto-select contact that matches user email by default
show duration in events view
show uptime percent
support port monitor type
ACL protect remote pinger api
go to login page if lost session
DDOS prevent - do not allow more than X monitors for the same domain
prevent being a DDOS tool (prevent pinging same site many times somehow, handle fake different url params)
use ssl
expire accounts after 1 year of no activity? yearly renewal email link?
handle form errors without browser alert boxes
require email confirmation? maybe just for more than 5 monitors or 1 week of service.
pause monitor while waiting for remote to check so don't get 2 emails on long timeouts
check for skipped seconds and email admin of load issue
"reset stats" option for each monitor
fix bug where another monitor's chart shows if current monitor has not pings
bug - monitor interval comes up unselected when editing a monitor
allow contacts to be deleted
do not close dialogs when there is an error

COULD
----------
support ping monitor type
localize dates in UI
ask if they want to fix redirects when monitor is created to reduce load
Translate HTTP number codes to their descriptions in UI, also translate node request error codes
save redirects so we don't keep following them everytime a monitor is pinged?
disable web ui on remote1.ubermon.com (disable db too?)
stop using unreliable namecheap forwareder for 'ubermon.com'
put remote pinger on a different company's network than the main engines
show account monitor count usage vs account max's
validate - don't allow creation of monitors for "down" sites
search box for monitor list
delete events and pings when a monitor is deleted

WOULD
----------
have client refresh fast after changes but slow down later to reduce load
login with facebook and/or google
validate - don't allow domains that do not exist
clean up inline styles and br tags
allow access to dashboard before creating account?
Combine monitors from different users that use the same URL
clicking in url should put cursor at end if "http://" is in it
minify bower_componenets.js (and provide.map files)
indicate which monitor is selected on monitor list
