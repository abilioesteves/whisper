package mail

import (
	"github.com/sirupsen/logrus"
	"net/smtp"
)

type Api interface {
	Init(user, password, host, port, identity string, inbox <-chan Mail) Api
	Run()
}

// Mail defines the email
type Mail struct {
	To      []string
	Content []byte
}

var _sendMail = smtp.SendMail

type DefaultHandler struct {
	user    string
	address string
	auth    smtp.Auth
	Inbox   <-chan Mail
}

// InitFromWebBuilder initializes a default email api instance
func (mh *DefaultHandler) Init(user, password, host, port, identity string, inbox <-chan Mail) Api {
	mh.user = user
	mh.address = host + ":" + port
	mh.auth = smtp.PlainAuth(identity, user, password, host)
	mh.Inbox = inbox

	return mh
}

func (mh *DefaultHandler) Run() {
	go func() {
		for mail := range mh.Inbox {
			err := _sendMail(mh.address, mh.auth, mh.user, mail.To, mail.Content)

			if err != nil {
				logrus.Error(err)
			}
		}
	}()
}
