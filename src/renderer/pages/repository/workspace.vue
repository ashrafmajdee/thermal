<template>
	<t-flexbox flex-direction="row" :flex-grow="1">
		<div ref="workspaceFiles" class="workspace__files">
			<t-flexbox flex-direction="column" style="overflow: hidden;">
				<t-flexbox
					ref="branchName"
					align-items="center"
					class="workspace__branch"
				>
					<branchIcon />
					<p>{{ this.$store.state.commit.activeBranch }}</p>
				</t-flexbox>
				<t-scrollbar
					style="height: calc(100vh - (106px + 41px + 65px + 34px))"
					width="100%"
				>
					<fileChangesSkeleton
						v-if="this.$store.getters['commit/allFiles'].length < 1"
					/>
					<div v-else>
						<t-flexbox
							v-for="file in this.$store.getters['commit/allFiles']"
							:key="file.path"
							class="workspace__changes__item"
							align-items="center"
							@click="previewFileChange(file)"
						>
							<input
								v-show="getFeatureValue.commit"
								v-model="stagedFile"
								class="workspace__changes__item__checkbox"
								type="checkbox"
								:value="file.path"
							/>
							<label :title="file.path" :for="file.path">
								<t-flexbox>
									<p class="workspace__changes__item__path__name">
										{{ filePath(file.path) }}
									</p>
									<p class="workspace__changes__item__path__file">
										{{ fileName(file.path) }}
									</p>
								</t-flexbox>
							</label>
							<div
								:style="'background-color: #' + fileTypeColor(file)"
								class="workspace__changes__item__type ml-auto"
							>
								{{ fileType(file) }}
							</div>
						</t-flexbox>
					</div>
				</t-scrollbar>
			</t-flexbox>
			<commitMessage
				ref="commitMessage"
				padding-top="10px"
				padding-bottom="10px"
				padding-left="10px"
				padding-right="10px"
			/>
		</div>
		<diffPreview
			v-if="this.$store.state.workspace.filePreview.isActive"
			:preview="fileDiffPreview"
		/>
		<blank-slate v-else />
	</t-flexbox>
</template>

<script>
import statusMixin from "../../git/status";
import diffMixin from "../../git/diff";
import repositoryDataMixin from "../../mixins/repositoryData";
import TScrollbar from "../../components/TLayouts/TScrollbar";
import commitMessage from "../../components/commit/commitMessage";
import branchIcon from "../../components/icon/branch";
import diffPreview from "../../components/diff/diffPreview";
import fileChangesSkeleton from "../../components/skeleton/fileChanges";
import BlankSlate from "../../components/BlankSlate";
import TFlexbox from "../../components/TLayouts/TFlexbox";

export default {
	name: "Workspace",
	components: {
		branchIcon,
		TScrollbar,
		commitMessage,
		diffPreview,
		fileChangesSkeleton,
		BlankSlate,
		TFlexbox
	},
	mixins: [repositoryDataMixin],
	data() {
		return {
			commitMessageTitle: "",
			fileColors: {
				modify: "57C9F6",
				new: "7CCD5F",
				delete: "EC746E",
				rename: "3585de",
				other: "E2E2E2"
			}
		};
	},
	computed: {
		stagedFile: {
			get() {
				return this.$store.getters["commit/allStagedFiles"];
			},
			set(value) {
				this.$store.dispatch({
					type: "commit/updateStagedFiles",
					staged: value
				});
			}
		},
		getFeatureValue() {
			return this.repositoryData.features;
		},
		fileDiffPreview() {
			return this.$store.state.workspace.filePreview.preview;
		},
		fileChangesSize() {
			return (
				this.$refs.workspaceFiles.clientHeight -
				this.$refs.branchName.clientHeight -
				this.$refs.commitMessage.clientHeight +
				"px"
			);
		}
	},
	mounted() {
		this.gitStatus();
		this.previewFileChange(this.$store.getters["commit/allFiles"][0]);
	},
	methods: {
		gitStatus() {
			statusMixin(this.repositoryData.path).then(result => {
				this.$store.dispatch({
					type: "commit/updateActiveBranch",
					branch: result.current
				});
				this.$store.commit({
					type: "commit/files",
					files: result.files
				});
			});
		},
		fileType(file) {
			switch (file.working_dir) {
				case "M":
					return "M";
				case "D":
					return "D";
				case "?":
					return "A";
				case " ":
					switch (file.index) {
						case "M":
							return "M";
						case "D":
							return "D";
						case "R":
							return "R";
						case "A":
							return "A";
					}
			}
		},
		fileTypeColor(file) {
			switch (file.working_dir) {
				case "M":
					return this.fileColors.modify;
				case "D":
					return this.fileColors.delete;
				case "?":
					return this.fileColors.new;
				case " ":
					switch (file.index) {
						case "M":
							return this.fileColors.modify;
						case "D":
							return this.fileColors.delete;
						case "R":
							return this.fileColors.rename;
						case "A":
							return this.fileColors.new;
					}
			}
		},
		filePath(path) {
			if (path.lastIndexOf("/").toString() !== "-1") {
				return path.slice(0, path.lastIndexOf("/"));
			}
		},
		fileName(path) {
			if (path.lastIndexOf("/").toString() !== "-1") {
				return path.slice(path.lastIndexOf("/"), path.length);
			}
			return path;
		},
		previewFileChange(file) {
			this.$store.commit({
				type: "workspace/toggleFilePreview",
				isActive: true
			});
			const params = ["HEAD", "--", `:${file.path}`];
			diffMixin(this.repositoryData.path, params).then(result => {
				let output = result.split("\n");
				output.splice(0, 3);
				this.$store.commit({
					type: "workspace/filePreview",
					preview: output
				});
			});
		}
	}
};
</script>

<style lang="sass">
.workspace
	&__files
		border-right: 1px solid #DEE0E3
		width: 300px

	&__branch
		background-color: #EFEFEF
		padding: 10px 20px
		border-bottom: 1px solid #DEE0E3

		svg
			width: 20px
			height: 20px
			stroke: #6C6F75

		p
			margin-left: 10px
			font-size: 14px
			font-weight: 600

	&__changes
		&__item
			border-bottom: 1px solid #DEE0E3
			font-size: 12px
			color: #2E3034
			padding: 6px 10px
			cursor: pointer

			&__checkbox
				margin-right: 5px

			&__path
				&__name
					color: #BEBEBE

			&__type
				padding: 3px 5px
				color: white
				border-radius: 3px

			&:hover
				background-color: rgba(#EFEFEF, .4)
</style>
