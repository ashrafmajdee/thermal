const state = {
	logs: {},
	commitInformation: {
		isActive: false,
		title: "",
		description: "",
		author: {
			name: "",
			email: "",
			date: ""
		},
		meta: {
			commit_hash: "",
			tree_hash: "",
			parent_hash: "",
			refs: ""
		},
		committer: {
			name: "",
			email: "",
			date: ""
		},
		files: {
			changes: "",
			additions: "",
			deletion: "",
			list: []
		}
	}
}

const getters = {
	allLogs: state => state.logs,
	getCommitInformation: state => state.commitInformation
}

const mutations = {
	updateLogs(state, payload) {
		state.logs = payload.logs
	},
	toggleCommitInformation(state) {
		state.commitInformation.isActive = !state.commitInformation.isActive
	},
	updateCommitInformation(state, payload) {
		state.commitInformation.title = payload.title
		state.commitInformation.description = payload.description
		// author
		state.commitInformation.author.name = payload.author_name
		state.commitInformation.author.email = payload.author_email
		state.commitInformation.author.date = payload.author_date
		// meta
		state.commitInformation.meta.commit_hash = payload.commit_hash
		state.commitInformation.meta.tree_hash = payload.tree_hash
		state.commitInformation.meta.parent_hash = payload.parent_hash
		state.commitInformation.meta.refs = payload.meta_refs
		// committer
		state.commitInformation.committer.name = payload.committer_name
		state.commitInformation.committer.email = payload.committer_email
		state.commitInformation.committer.date = payload.committer_date
		// files
		state.commitInformation.files.changes = payload.files_changes
		state.commitInformation.files.additions = payload.files_additions
		state.commitInformation.files.deletion = payload.files_deletion
		state.commitInformation.files.list = payload.files_list
	}
}

const actions = {
	getRepositoryLogs: ({ commit }, payload) => {
		commit({
			type: "updateLogs",
			logs: payload.logs
		})
	},
	showCommitInformation: ({ commit }) => {
		commit({
			type: "toggleCommitInformation"
		})
	},
	updateCommitInformationCommitHash: ({ commit }, payload) => {
		commit({
			type: "updateCommitInformation",
			commit_hash: payload.commit_hash
		})
	},
	updateCommitInformationAuthor: ({ commit }, payload) => {
		commit({
			type: "updateCommitInformation",
			author_name: payload.author_name,
			author_email: payload.author_email
		})
	}
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
