document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card"); // Corrected this line

    // Function to validate the username with regex
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    // Fetch user details function
    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; 
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `query userSessionProgress($username: String!) {
                    allQuestionsCount { difficulty count }
                    matchedUser(username: $username) {
                        submitStats { acSubmissionNum { difficulty count submissions }
                            totalSubmissionNum { difficulty count submissions }
                        }
                    }
                }`,
                variables: { "username": `${username}` }
            });
            
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) throw new Error("Unable to fetch the User details");

            const parsedData = await response.json();
            displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const { allQuestionsCount, matchedUser } = parsedData.data;
        const [totalQues, totalEasyQues, totalMediumQues, totalHardQues] = allQuestionsCount.map(item => item.count);
        const [solvedTotalQues, solvedTotalEasyQues, solvedTotalMediumQues, solvedTotalHardQues] = matchedUser.submitStats.acSubmissionNum.map(item => item.count);

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: matchedUser.submitStats.totalSubmissionNum[0].submissions },
            { label: "Overall Easy Submissions", value: matchedUser.submitStats.totalSubmissionNum[1].submissions },
            { label: "Overall Medium Submissions", value: matchedUser.submitStats.totalSubmissionNum[2].submissions },
            { label: "Overall Hard Submissions", value: matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        cardStatsContainer.innerHTML = cardsData.map(
            data => `<div class="card"><h4>${data.label}</h4><p>${data.value}</p></div>`
        ).join("");
    }

    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
