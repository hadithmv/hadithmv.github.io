image: ruby:latest

variables:
  JEKYLL_ENV: production
  LC_ALL: C.UTF-8

before_script:
  - gem install bundler
  - bundle install

test:
  stage: test
  script:
  - bundle exec jekyll build -d test
  artifacts:
    paths:
    - test
  rules:
    - if: $CI_COMMIT_REF_NAME != $CI_DEFAULT_BRANCH

pages:
  stage: deploy
  script:
  - bundle exec jekyll build -d public
  artifacts:
    paths:
    - public
  rules:
    - if: $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
