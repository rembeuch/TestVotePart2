const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("Voting", (accounts) => {
    const owner = accounts[0];
    const voter = accounts[1];
    const voter2 = accounts[2];

    let votingInstance;

    describe("test getters", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner })
        });

        it('should not allow msg.sender to getVoter if is not registered', async () => {
            await expectRevert(
                votingInstance.getVoter(voter, { from: voter }),
                "You're not a voter"
            );
        });
        it('should not allow msg.sender to getOneProposal if is not registered', async () => {
            await expectRevert(
                votingInstance.getOneProposal(0, { from: voter }),
                "You're not a voter"
            );
        });

        it("should show a voter", async () => {
            const voterDetails = await votingInstance.getVoter(owner, { from: owner });
            expect(voterDetails.isRegistered).to.be.true;
        });

        it("should show a proposal", async () => {
            const proposalDetails = await votingInstance.getOneProposal(0, { from: owner });
            expect(proposalDetails.description).to.equal("GENESIS");
        });
    });

    describe("Votter Registered", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
        });

        it("should not add a voter if workflow status is not good", async () => {
            await votingInstance.startProposalsRegistering({ from: owner })
            await expectRevert(
                votingInstance.addVoter(voter, { from: owner }),
                "Voters registration is not open yet"
            );
        });

        it("should not add an existing voter", async () => {
            await expectRevert(
                votingInstance.addVoter(owner, { from: owner }),
                "Already registered"
            );
        });

        it("should not allow a non-owner to add a voter", async () => {
            await expectRevert(
                votingInstance.addVoter(voter, { from: voter }),
                "caller is not the owner"
            );
        });

        it("check addVoter", async () => {
            const { logs } = await votingInstance.addVoter(voter, { from: owner });
            const voterDetails = await votingInstance.getVoter.call(voter, { from: owner });
            expect(voterDetails.isRegistered).to.be.true;

            expectEvent.inLogs(logs, "VoterRegistered", { voterAddress: voter });
        });
    });

    describe("start proposal Workflow", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
        });

        it("should not startProposalRegistering if workflow status is not good", async () => {
            await votingInstance.startProposalsRegistering({ from: owner })
            await votingInstance.endProposalsRegistering({ from: owner })

            await expectRevert(
                votingInstance.startProposalsRegistering({ from: owner }),
                "Registering proposals cant be started now"
            );
        });

        it("check startProposalRegistering", async () => {
            const { logs } = await votingInstance.startProposalsRegistering({ from: owner })
            const firstProposal = await votingInstance.getOneProposal.call(0, { from: owner })
            expect(firstProposal.description).to.equal("GENESIS", "Les mots sont pas les memes");
            expect(firstProposal.voteCount).to.be.bignumber.equal(new BN(0))
            expectEvent.inLogs(logs, "WorkflowStatusChange");
        });
    });

    describe("add a proposal", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner });
        });

        it("should not addProposal if workflow status is not good", async () => {
            await votingInstance.endProposalsRegistering({ from: owner })
            await expectRevert(
                votingInstance.addProposal("description", { from: owner }),
                "Proposals are not allowed yet"
            );
        });

        it("should not addProposal if description is empty", async () => {
            await expectRevert(
                await votingInstance.addProposal("", { from: owner }),
                "Vous ne pouvez pas ne rien proposer"
            );
        });

        it("check addProposal", async () => {
            const { logs } = await votingInstance.addProposal("description", { from: owner });
            const proposal = await votingInstance.getOneProposal.call("1", { from: owner })
            expect(proposal.description).to.equal("description")
            expect(proposal.voteCount).to.be.bignumber.equal(new BN(0))
            expectEvent.inLogs(logs, "ProposalRegistered", { proposalId: "1" });
        });

    });

    describe("end proposal session", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner });
        });

        it("should not EndProposalRegistering if workflow status is not good", async () => {
            await votingInstance.endProposalsRegistering({ from: owner });
            await votingInstance.startVotingSession({ from: owner })
            await expectRevert(
                votingInstance.endProposalsRegistering({ from: owner }),

                "Registering proposals havent started yet"
            );
        });

        it("check endProposalRegistering", async () => {
            const { logs } = await votingInstance.endProposalsRegistering({ from: owner })
            const newWorkflowStatus = await votingInstance.workflowStatus();
            expect(newWorkflowStatus).to.be.bignumber.equal(new BN(2))
            expectEvent.inLogs(logs, "WorkflowStatusChange");
        });

    });


    describe("start voting session", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner });
            await votingInstance.endProposalsRegistering({ from: owner });
        });

        it("should not startVotingSession if workflow status is not good", async () => {
            await votingInstance.startVotingSession({ from: owner });
            await votingInstance.endVotingSession({ from: owner });
            await expectRevert(
                votingInstance.startVotingSession({ from: owner }),
                "Registering proposals phase is not finished"
            );
        });

        it("check startVotingSession", async () => {
            const { logs } = await votingInstance.startVotingSession({ from: owner })
            const newWorkflowStatus = await votingInstance.workflowStatus();
            expect(newWorkflowStatus).to.be.bignumber.equal(new BN(3))
            expectEvent.inLogs(logs, "WorkflowStatusChange");
        });
    });

    describe("Set vote", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner });
            await votingInstance.addProposal("description", { from: owner });
            await votingInstance.endProposalsRegistering({ from: owner });
            await votingInstance.startVotingSession({ from: owner });
        });

        it("should not set vote if workflow status is not good", async () => {
            await votingInstance.endVotingSession({ from: owner });
            await expectRevert(
                votingInstance.setVote(1, { from: owner }),
                "Voting session havent started yet"
            );
        });

        it("should not set vote if voter already vote", async () => {
            await votingInstance.setVote(1, { from: owner });
            await expectRevert(
                votingInstance.setVote(1, { from: owner }),
                "You have already voted"
            );
        });

        it("should not set vote if proposal not found", async () => {
            await expectRevert(
                votingInstance.setVote(3, { from: owner }),
                "Proposal not found"
            );
        });

        it("check setVote", async () => {
            const { logs } = await votingInstance.setVote(1, { from: owner })
            const voterDetails = await votingInstance.getVoter.call(owner, { from: owner });
            const proposal = await votingInstance.getOneProposal.call("1", { from: owner })
            expect(voterDetails.hasVoted).to.be.true;
            expect(voterDetails.votedProposalId).to.be.bignumber.equal(new BN(1))
            expect(proposal.voteCount).to.be.bignumber.equal(new BN(1))
            expectEvent.inLogs(logs, "Voted", { voter: owner, proposalId: "1" });
        });
    });

    describe("end vote session", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner });
            await votingInstance.endProposalsRegistering({ from: owner });
            await votingInstance.startVotingSession({ from: owner });
        });

        it("should not endVotingSession if workflow status is not good", async () => {
            await votingInstance.endVotingSession({ from: owner });
            await expectRevert(
                votingInstance.endVotingSession({ from: owner }),
                "Voting session havent started yet"
            );
        });

        it("check endVotingSession", async () => {
            const { logs } = await votingInstance.endVotingSession({ from: owner })
            const newWorkflowStatus = await votingInstance.workflowStatus();
            expect(newWorkflowStatus).to.be.bignumber.equal(new BN(4))
            expectEvent.inLogs(logs, "WorkflowStatusChange");
        });

    });

    describe("tally votes", function () {
        beforeEach(async () => {
            votingInstance = await Voting.new({ from: owner });
            await votingInstance.addVoter(owner, { from: owner });
            await votingInstance.addVoter(voter, { from: owner });
            await votingInstance.addVoter(voter2, { from: owner });
            await votingInstance.startProposalsRegistering({ from: owner });
            await votingInstance.addProposal("description", { from: owner });
            await votingInstance.addProposal("second proposal", { from: owner });
            await votingInstance.endProposalsRegistering({ from: owner });
            await votingInstance.startVotingSession({ from: owner });
            await votingInstance.setVote(1, { from: owner });
            await votingInstance.setVote(1, { from: voter });
            await votingInstance.setVote(2, { from: voter2 });
            await votingInstance.endVotingSession({ from: owner });
        });

        it("should not tally votes if workflow status is not good", async () => {
            await votingInstance.tallyVotes({ from: owner });
            await expectRevert(
                votingInstance.tallyVotes({ from: owner }),
                "Current status is not voting session ended"
            );
        });

        it("should tally votes correctly", async () => {
            const { logs } = await votingInstance.tallyVotes({ from: owner });
            const newWorkflowStatus = await votingInstance.workflowStatus();
            expect(newWorkflowStatus).to.be.bignumber.equal(new BN(5))
            const winningProposalID = await votingInstance.winningProposalID();
            expect(winningProposalID).to.be.bignumber.equal(new BN(1))
            expectEvent.inLogs(logs, "WorkflowStatusChange");
        });
    });
});

