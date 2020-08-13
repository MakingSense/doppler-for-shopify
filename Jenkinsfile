pipeline {
    agent any
    stages {
        stage('Restore') {
            steps {
                sh 'docker build --target restore -f Dockerfile.swarm .'
            }
        }
        stage('Test') {
            steps {
                sh 'docker build --target test -f Dockerfile.swarm .'
            }
        }
        stage('Build') {
            steps {
                sh 'docker build --target build -f Dockerfile.swarm .'
            }
        }
        stage('Publish pre-release images from pull request') {
            when {
                changeRequest target: 'master'
            }
            steps {
                sh 'sh build-n-publish.sh --commit=${GIT_COMMIT} --name=pr-${CHANGE_ID}'
            }
        }
        stage('Publish pre-release images from master') {
            when {
                branch 'master'
            }
            steps {
                sh 'sh build-n-publish.sh --commit=${GIT_COMMIT} --name=master'
            }
        }
        stage('Publish pre-release images from INT') {
            when {
                branch 'INT'
            }
            steps {
                sh 'sh build-n-publish.sh --commit=${GIT_COMMIT} --name=INT'
            }
        }
        stage('Publish pre-release images from PROD') {
			// Temporal build for testing easily in production
            when {
                branch 'PROD'
            }
            steps {
                sh 'sh build-n-publish.sh --commit=${GIT_COMMIT} --name=PROD'
            }
        }
        stage('Publish final version images') {
            when {
                expression {
                    return isVersionTag(readCurrentTag())
                }
            }
            steps {
                sh 'sh build-n-publish.sh --commit=${GIT_COMMIT} --version=${TAG_NAME}'
            }
        }
        stage('Generate version') {
            when {
                branch 'master'
            }
            steps {
                sh 'echo "TODO: generate a tag automatically"'
            }
        }
    }
}



def boolean isVersionTag(String tag) {
    echo "checking version tag $tag"

    if (tag == null) {
        return false
    }

    // use your preferred pattern
    def tagMatcher = tag =~ /v\d+\.\d+\.\d+/

    return tagMatcher.matches()
}

def CHANGE_ID = env.CHANGE_ID

// https://stackoverflow.com/questions/56030364/buildingtag-always-returns-false
// workaround https://issues.jenkins-ci.org/browse/JENKINS-55987
// TODO: read this value from Jenkins provided metadata
def String readCurrentTag() {
    return sh(returnStdout: true, script: "git describe --tags --match v?*.?*.?* --abbrev=0 --exact-match || echo ''").trim()
}
