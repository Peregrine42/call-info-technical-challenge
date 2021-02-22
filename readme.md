# Task details

We need to display some call statistics to the metrics team to help them debug potential call issues.

The data relating to these calls is located in the `./data` folder, but for the purpose of this challenge, please assume that it is being retrieved from an S3 bucket on AWS and code accordingly.

Your task is to retrieve these files, store the data within the application, and display the calls to the end user in a method which allows them:

1. To see which calls have taken place
2. Which team conducted the calls
3. Which participants were involved in the calls  
   a. If a call duration is under 2 minutes it is an indication of a problem with the call, and the call should be flagged as having a potential issue in some way.

# How we will review

The following areas will be taken into consideration when reviewing this code:

1. How clean is the separation between any business logic and presentation related code?
2. How testable is the code?
3. What sort of decisions were made around libraries, tooling, etc?
4. Is the code simple, easy to understand, and maintainable?
5. Does the code follow the relevant language's guidelines?
